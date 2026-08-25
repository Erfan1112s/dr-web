// app/api/chat/admin/reply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ============================================================
// POST: ارسال پاسخ ادمین به یک پیام کاربر
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { messageId, reply } = await req.json();

    if (!messageId || !reply) {
      return NextResponse.json(
        { error: 'شناسه پیام و پاسخ الزامی است' },
        { status: 400 }
      );
    }

    // ============================================================
    // ۱. پیدا کردن پیام مورد نظر
    // ============================================================
    const targetMessage = await prisma.chatMessage.findUnique({
      where: { id: parseInt(messageId) },
    });

    if (!targetMessage) {
      return NextResponse.json(
        { error: 'پیام یافت نشد' },
        { status: 404 }
      );
    }

    // ============================================================
    // ۲. به‌روزرسانی پیام با پاسخ ادمین و غیرفعال‌سازی ربات
    // ============================================================
    const updated = await prisma.chatMessage.update({
      where: { id: parseInt(messageId) },
      data: {
        adminReply: reply,
        botDisabled: true, // ربات را برای این session غیرفعال کن
      },
    });

    // ============================================================
    // ۳. همه پیام‌های این session را نیز botDisabled=true کن
    // ============================================================
    await prisma.chatMessage.updateMany({
      where: { sessionId: targetMessage.sessionId },
      data: { botDisabled: true },
    });

    console.log(`✅ پاسخ ادمین برای پیام ${messageId} ارسال شد و ربات غیرفعال شد`);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'پاسخ با موفقیت ارسال شد و ربات برای این کاربر غیرفعال شد.',
    });
  } catch (error) {
    console.error('❌ Error in admin reply:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال پاسخ' },
      { status: 500 }
    );
  }
}