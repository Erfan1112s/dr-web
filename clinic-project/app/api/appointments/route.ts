// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentSMS, sendAdminNotification } from '@/lib/sms';
import { toJalaliDateForSMS } from '@/lib/date-utils';

// ============================================================
// GET: دریافت ساعت‌های آزاد یا نوبت‌های کاربر
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day');
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');

    // اگر userId وجود داشت، نوبت‌های کاربر را برگردان
    if (userId) {
      console.log(`📋 دریافت نوبت‌های کاربر ${userId}`);
      const appointments = await prisma.appointment.findMany({
        where: { userId: parseInt(userId) },
        orderBy: { date: 'desc' },
      });
      return NextResponse.json(appointments);
    }

    // اگر day و date وجود داشت، ساعت‌های آزاد آن روز را محاسبه کن
    if (day && date) {
      console.log(`📅 دریافت درخواست برای روز: ${day}, تاریخ: ${date}`);

      // ✅ بررسی اعتبار تاریخ
      let dateObj: Date;
      try {
        dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          console.error('❌ تاریخ نامعتبر:', date);
          return NextResponse.json(
            { error: 'تاریخ نامعتبر است' },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error('❌ خطا در parse تاریخ:', err);
        return NextResponse.json(
          { error: 'تاریخ نامعتبر است' },
          { status: 400 }
        );
      }

      // بازه زمانی روز مورد نظر
      const start = new Date(dateObj);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateObj);
      end.setHours(23, 59, 59, 999);

      console.log(`📅 بازه جستجو: ${start.toISOString()} تا ${end.toISOString()}`);

      // ✅ بررسی وجود جدول و فیلد date
      let appointments;
      try {
        appointments = await prisma.appointment.findMany({
          where: {
            date: {
              gte: start,
              lt: end,
            },
          },
          select: { time: true },
        });
      } catch (dbError) {
        console.error('❌ خطا در کوئری دیتابیس:', dbError);
        return NextResponse.json(
          { error: 'خطا در ارتباط با دیتابیس' },
          { status: 500 }
        );
      }

      console.log(`📋 نوبت‌های موجود:`, appointments.map(a => a.time));

      const bookedTimes = appointments.map((a) => a.time);
      const allTimes = ['۴:۳۰', '۵:۰۰', '۵:۳۰', '۶:۰۰', '۶:۳۰', '۷:۰۰', '۷:۳۰', '۸:۰۰', '۸:۳۰'];
      const availableTimes = allTimes.filter((t) => !bookedTimes.includes(t));

      console.log(`✅ ساعت‌های آزاد:`, availableTimes);

      return NextResponse.json({
        available: availableTimes,
        booked: bookedTimes,
      });
    }

    // اگر هیچ پارامتری نبود، همه نوبت‌ها را برگردان (برای ادمین)
    console.log('📋 دریافت همه نوبت‌ها (برای ادمین)');
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('❌ خطا در GET /api/appointments:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: ثبت نوبت جدید
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { day, date, jalaliDate, time, name, phone, description, userId } = body;

    // اعتبارسنجی
    if (!day || !date || !time || !name || !phone) {
      return NextResponse.json(
        { error: 'تمام فیلدهای اجباری را پر کنید' },
        { status: 400 }
      );
    }

    let dateObj: Date;
    try {
      dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.error('❌ تاریخ نامعتبر:', date);
        return NextResponse.json(
          { error: 'تاریخ نامعتبر است' },
          { status: 400 }
        );
      }
    } catch (err) {
      console.error('❌ خطا در parse تاریخ:', err);
      return NextResponse.json(
        { error: 'تاریخ نامعتبر است' },
        { status: 400 }
      );
    }

    // بازه زمانی روز مورد نظر
    const start = new Date(dateObj);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateObj);
    end.setHours(23, 59, 59, 999);

    // بررسی تکراری نبودن نوبت
    const existing = await prisma.appointment.findFirst({
      where: {
        date: {
          gte: start,
          lt: end,
        },
        time,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'این ساعت قبلاً پر شده است' },
        { status: 409 }
      );
    }

    // ذخیره در دیتابیس
    const appointment = await prisma.appointment.create({
      data: {
        patientName: name,
        patientPhone: phone,
        day,
        date: dateObj,
        time,
        description: description || '',
        status: 'pending',
        userId: userId ? parseInt(userId) : null,
      },
    });

    console.log('✅ نوبت جدید ثبت شد:', appointment);

    // ارسال پیامک به بیمار
    let smsSent = false;
    try {
      const jalaliDateStr = jalaliDate || toJalaliDateForSMS(dateObj);
      console.log(`📤 تلاش برای ارسال پیامک به ${phone}...`);
      const smsResult = await sendAppointmentSMS(phone, name, jalaliDateStr, day, time);
      if (smsResult.success) {
        smsSent = true;
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { smsSent: true },
        });
        console.log('✅ پیامک با موفقیت ارسال شد');
      } else {
        console.error('❌ خطا در ارسال پیامک:', smsResult.error);
      }
    } catch (error) {
      console.error('❌ خطای غیرمنتظره در ارسال پیامک:', error);
    }

    // ارسال پیامک به ادمین
    try {
      await sendAdminNotification(name, phone, day, time);
    } catch (adminError) {
      console.error('❌ خطا در ارسال پیامک به ادمین:', adminError);
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      smsSent,
    });
  } catch (error) {
    console.error('❌ خطا در POST /api/appointments:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت نوبت. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT: به‌روزرسانی نوبت
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, patientName, patientPhone, day, date, time, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'شناسه نوبت الزامی است' },
        { status: 400 }
      );
    }

    const data: any = {};
    if (status) data.status = status;
    if (patientName) data.patientName = patientName;
    if (patientPhone) data.patientPhone = patientPhone;
    if (day) data.day = day;
    if (date) {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        data.date = dateObj;
      }
    }
    if (time) data.time = time;
    if (description !== undefined) data.description = description;

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('❌ خطا در PUT /api/appointments:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی نوبت' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE: حذف نوبت
// ============================================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'شناسه نوبت الزامی است' },
        { status: 400 }
      );
    }

    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, message: 'نوبت با موفقیت حذف شد' });
  } catch (error) {
    console.error('❌ خطا در DELETE /api/appointments:', error);
    return NextResponse.json(
      { error: 'خطا در حذف نوبت' },
      { status: 500 }
    );
  }
}