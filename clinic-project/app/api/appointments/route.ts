// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================
// GET: دریافت نوبت‌ها (با فیلتر userId یا day)
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const day = searchParams.get('day');

    // اگر day وجود داشته باشد، ساعت‌های آزاد آن روز را محاسبه کن
    if (day) {
      // دریافت نوبت‌های آن روز
      const appointments = await prisma.appointment.findMany({
        where: { day },
        select: { time: true },
      });

      const bookedTimes = appointments.map((a) => a.time);
      const allTimes = ['۴:۳۰', '۵:۰۰', '۵:۳۰', '۶:۰۰', '۶:۳۰', '۷:۰۰', '۷:۳۰', '۸:۰۰', '۸:۳۰'];
      const availableTimes = allTimes.filter((t) => !bookedTimes.includes(t));

      return NextResponse.json({ available: availableTimes, booked: bookedTimes });
    }

    // اگر userId وجود داشته باشد، نوبت‌های آن کاربر را برگردان
    if (userId) {
      const appointments = await prisma.appointment.findMany({
        where: { userId: parseInt(userId) },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(appointments);
    }

    // اگر هیچ فیلتری نبود، همه نوبت‌ها را برگردان (برای ادمین)
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('❌ Error in GET /api/appointments:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نوبت‌ها' },
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
        day,
        time,
        description: description || '',
        status: 'pending',
        userId: userId ? parseInt(userId) : null,
      },
    });

    // (اختیاری) ارسال پیامک
    // await sendAppointmentSMS(phone, name, day, time);

    console.log('✅ نوبت جدید ثبت شد:', appointment);
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('❌ Error in POST /api/appointments:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت نوبت' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT: به‌روزرسانی نوبت (تغییر وضعیت)
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'شناسه نوبت الزامی است' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('❌ Error in PUT /api/appointments:', error);
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error in DELETE /api/appointments:', error);
    return NextResponse.json(
      { error: 'خطا در حذف نوبت' },
      { status: 500 }
    );
  }
}