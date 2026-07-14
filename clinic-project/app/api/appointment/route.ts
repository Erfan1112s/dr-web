// app/api/appointment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentSMS, sendAdminNotification } from '@/lib/sms';

// دریافت ساعت‌های آزاد (GET)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day');

    if (!day) {
      return NextResponse.json({ error: 'روز را مشخص کنید' }, { status: 400 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { day: day },
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

    return NextResponse.json({ available: availableTimes, booked: bookedTimes });
  } catch (error) {
    console.error('❌ خطا در دریافت ساعت‌های آزاد:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات' }, { status: 500 });
  }
}

// ثبت نوبت جدید (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { day, time, name, phone, description } = body;

    // اعتبارسنجی
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

    // ذخیره در دیتابیس
    const appointment = await prisma.appointment.create({
      data: {
        patientName: name,
        patientPhone: phone,
        day: day,
        time: time,
        description: description || '',
        status: 'pending',
      },
    });

    // =============================================
    // 🚀 **ارسال پیامک به بیمار**
    // =============================================
    let smsSent = false;
    let smsError = null;

    try {
      const smsResult = await sendAppointmentSMS(phone, name, day, time);
      if (smsResult.success) {
        smsSent = true;
        // به‌روزرسانی وضعیت پیامک در دیتابیس
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { smsSent: true },
        });
        console.log(`✅ پیامک تأیید برای ${phone} ارسال شد`);
      } else {
        smsError = smsResult.error;
        console.error('❌ خطا در ارسال پیامک به بیمار:', smsError);
      }
    } catch (smsErr) {
      console.error('❌ خطای غیرمنتظره در ارسال پیامک:', smsErr);
      smsError = 'خطا در ارسال پیامک';
    }

    // =============================================
    // 📨 **ارسال پیامک به ادمین (اختیاری)**
    // =============================================
    try {
      await sendAdminNotification(name, phone, day, time);
    } catch (adminErr) {
      console.error('❌ خطا در ارسال پیامک به ادمین:', adminErr);
      // اگر ارسال به ادمین ناموفق بود، تأثیری روی پاسخ نهایی ندارد
    }

    // پاسخ به کاربر
    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      smsSent: smsSent,
      smsError: smsError,
      message: smsSent
        ? 'نوبت با موفقیت ثبت شد. پیامک تأیید برای شما ارسال شد.'
        : 'نوبت با موفقیت ثبت شد، اما پیامک تأیید ارسال نشد. لطفاً با مطب تماس بگیرید.',
    });
  } catch (error) {
    console.error('❌ خطا در ثبت نوبت:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت نوبت. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}