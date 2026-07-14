// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password } = await req.json();

    // اعتبارسنجی
    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'تمام فیلدها را پر کنید' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن شماره موبایل
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'این شماره موبایل قبلاً ثبت شده است' },
        { status: 409 }
      );
    }

    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // ایجاد کاربر جدید
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: 'patient', // پیش‌فرض: بیمار
      },
    });

    return NextResponse.json({
      success: true,
      message: 'حساب با موفقیت ساخته شد',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت‌نام' },
      { status: 500 }
    );
  }
}