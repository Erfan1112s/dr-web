// app/api/appointment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import axios from 'axios';

// دریافت ساعت‌های آزاد (GET)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day');

    if (!day) {
      return NextResponse.json({ error: 'روز را مشخص کنید' }, { status: 400 });
    }

    // دریافت نوبت‌های ثبت‌شده برای این روز
    const appointments = await prisma.appointment.findMany({
      where: { day: day },
      select: { time: true },
    });

    const bookedTimes = appointments.map((a) => a.time);
    
    // لیست تمام ساعات
    const allTimes = [
      '۴:۳۰', '۵:۰۰', '۵:۳۰', '۶:۰۰', 
      '۶:۳۰', '۷:۰۰', '۷:۳۰', '۸:۰۰', '۸:۳۰'
    ];

    // ساعت‌های آزاد
    const availableTimes = allTimes.filter((t) => !bookedTimes.includes(t));

    return NextResponse.json({ 
      available: availableTimes,
      booked: bookedTimes,
    });
  } catch (error) {
    console.error(error);
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

    // ارسال پیامک با کاوه‌نگار
    let smsSent = false;
    try {
      const kavenegarApiKey = process.env.KAVENEGAR_API_KEY;
      if (kavenegarApiKey) {
        const message = `سلام ${name} عزیز 🌸\nنوبت شما در مطب خانم بصارت برای روز ${day} ساعت ${time} با موفقیت ثبت شد.\nآدرس: خمینی‌شهر، خیابان بوعلی، روبروی بانک مسکن\nتلفن: ۰۳۱۳۲۶۷۱۰۵۵`;
        
        await axios.post(
          `https://api.kavenegar.com/v1/${kavenegarApiKey}/sms/send.json`,
          {
            receptor: phone,
            message: message,
          }
        );
        smsSent = true;

        // به‌روزرسانی وضعیت پیامک
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { smsSent: true },
        });
      }
    } catch (smsError) {
      console.error('خطا در ارسال پیامک:', smsError);
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      smsSent: smsSent,
      message: 'نوبت با موفقیت ثبت شد',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'خطا در ثبت نوبت' },
      { status: 500 }
    );
  }
}