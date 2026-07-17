import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: دریافت همه نوبت‌ها (با فیلتر اختیاری)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const day = searchParams.get('day');

    const where: any = {};
    if (userId) where.userId = parseInt(userId);
    if (day) where.day = day;

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    return NextResponse.json({ error: 'خطا در دریافت نوبت‌ها' }, { status: 500 });
  }
}

// POST: ثبت نوبت جدید
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { day, time, name, phone, description } = body;

    if (!day || !time || !name || !phone) {
      return NextResponse.json({ error: 'تمام فیلدهای اجباری را پر کنید' }, { status: 400 });
    }

    const existing = await prisma.appointment.findFirst({
      where: { day, time },
    });

    if (existing) {
      return NextResponse.json({ error: 'این ساعت قبلاً پر شده است' }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientName: name,
        patientPhone: phone,
        day,
        time,
        description: description || '',
        status: 'pending',
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    return NextResponse.json({ error: 'خطا در ثبت نوبت' }, { status: 500 });
  }
}

// PUT: به‌روزرسانی نوبت (تغییر وضعیت یا ویرایش)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, patientName, patientPhone, day, time, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'شناسه نوبت الزامی است' }, { status: 400 });
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
    console.error('❌ Error updating appointment:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی نوبت' }, { status: 500 });
  }
}

// DELETE: حذف نوبت
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'شناسه نوبت الزامی است' }, { status: 400 });
    }

    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'نوبت با موفقیت حذف شد' });
  } catch (error) {
    console.error('❌ Error deleting appointment:', error);
    return NextResponse.json({ error: 'خطا در حذف نوبت' }, { status: 500 });
  }
}
