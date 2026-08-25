// app/api/chat/admin/enable-bot/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'شناسه جلسه الزامی است' },
        { status: 400 }
      );
    }

    // پیدا کردن آخرین پیام این session
    const lastMessage = await prisma.chatMessage.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastMessage) {
      return NextResponse.json(
        { error: 'هیچ پیامی برای این جلسه یافت نشد' },
        { status: 404 }
      );
    }

    // فعال‌سازی مجدد ربات
    await prisma.chatMessage.update({
      where: { id: lastMessage.id },
      data: { botDisabled: false },
    });

    return NextResponse.json({
      success: true,
      message: 'ربات با موفقیت فعال شد',
    });
  } catch (error) {
    console.error('❌ Error enabling bot:', error);
    return NextResponse.json(
      { error: 'خطا در فعال‌سازی ربات' },
      { status: 500 }
    );
  }
}