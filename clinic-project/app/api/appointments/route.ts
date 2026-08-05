// app/api/appointment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentSMS } from '@/lib/sms';
// ============================================================
// GET: دریافت ساعت‌های آزاد یک روز خاص
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day');

    if (!day) {
      return NextResponse.json(
        { error: 'روز را مشخص کنید' },
        { status: 400 }
      );
    }

    // دریافت نوبت‌های ثبت‌شده برای آن روز
    const appointments = await prisma.appointment.findMany({
      where: { day },
      select: { time: true },
    });

    const bookedTimes = appointments.map((a) => a.time);
    const allTimes = [
      '۴:۳۰',
      '۵:۰۰',
      '۵:۳۰',
      '۶:۰۰',
      '۶:۳۰',
      '۷:۰۰',
      '۷:۳۰',
      '۸:۰۰',
      '۸:۳۰',
    ];
    const availableTimes = allTimes.filter((t) => !bookedTimes.includes(t));

    return NextResponse.json({
      available: availableTimes,
      booked: bookedTimes,
    });
  } catch (error) {
    console.error('❌ خطا در دریافت ساعت‌های آزاد:', error);
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
    const { day, time, name, phone, description, userId } = body;

    // اعتبارسنجی ورودی‌ها
    if (!day || !time || !name || !phone) {
      return NextResponse.json(
        { error: 'تمام فیلدهای اجباری را پر کنید' },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن نوبت
    const existing = await prisma.appointment.findFirst({
      where: { day, time },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'این ساعت قبلاً پر شده است' },
        { status: 409 }
      );
    }

    // ذخیره نوبت در دیتابیس
    const appointment = await prisma.appointment.create({
      data: {
        patientName: name,
        patientPhone: phone,
        day,
        time,
        description: description || '',
        status: 'pending',
        userId: userId ? parseInt(userId) : null,
      },
    });

    console.log('✅ نوبت جدید ثبت شد:', appointment);

    // ============================================================
    // ارسال پیامک به بیمار
    // ============================================================
    let smsSent = false;
    let smsError = null;

    try {
      console.log(` تلاش برای ارسال پیامک به ${phone}...`);
      const smsResult = await sendAppointmentSMS(phone, name, day, time);
      console.log('نتیجه ارسال پیامک:', smsResult);

      if (smsResult.success) {
        smsSent = true;
        // به‌روزرسانی وضعیت smsSent در دیتابیس
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { smsSent: true },
        });
        console.log('✅ پیامک با موفقیت ارسال شد و وضعیت به‌روز شد');
      } else {
        smsError = smsResult.error;
        console.error('❌ خطا در ارسال پیامک به بیمار:', smsError);
      }
    } catch (error) {
      console.error('❌ خطای غیرمنتظره در ارسال پیامک:', error);
      smsError = 'خطا در ارسال پیامک';
    }

    // ============================================================
    // ارسال پیامک به ادمین (اختیاری - در صورت نیاز)
    // ============================================================
    try {
      await sendAdminNotification(name, phone, day, time);
      console.log('✅ پیامک ادمین ارسال شد (در صورت تنظیم)');
    } catch (adminError) {
      console.error('❌ خطا در ارسال پیامک به ادمین:', adminError);
      // این خطا نباید پاسخ نهایی را مختل کند
    }

    // ============================================================
    // پاسخ نهایی به کاربر
    // ============================================================
    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      smsSent: smsSent,
      smsError: smsError,
      message: smsSent
        ? 'نوبت با موفقیت ثبت شد. پیامک تأیید برای شما ارسال شد.'
        : 'نوبت با موفقیت ثبت شد، اما ارسال پیامک با مشکل مواجه شد. لطفاً با مطب تماس بگیرید.',
    });
  } catch (error) {
    console.error('❌ خطا در ثبت نوبت:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت نوبت. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT: به‌روزرسانی وضعیت یا اطلاعات نوبت
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, patientName, patientPhone, day, time, description } = body;

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
    if (time) data.time = time;
    if (description !== undefined) data.description = description;

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی نوبت:', error);
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
    console.error('❌ خطا در حذف نوبت:', error);
    return NextResponse.json(
      { error: 'خطا در حذف نوبت' },
      { status: 500 }
    );
  }
}