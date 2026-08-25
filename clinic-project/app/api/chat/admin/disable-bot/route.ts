// app/api/chat/admin/disable-bot/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ============================================================
// POST: غیرفعال‌سازی ربات برای یک session
// ============================================================
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

    // بررسی وجود session
    const message = await prisma.chatMessage.findFirst({
      where: { sessionId },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'هیچ پیامی برای این جلسه یافت نشد' },
        { status: 404 }
      );
    }

    // غیرفعال‌سازی ربات برای همه پیام‌های این session
    await prisma.chatMessage.updateMany({
      where: { sessionId },
      data: { botDisabled: true },
    });

    console.log(`✅ ربات برای session ${sessionId} غیرفعال شد`);

    return NextResponse.json({
      success: true,
      message: 'ربات با موفقیت غیرفعال شد',
    });
  } catch (error) {
    console.error('❌ Error disabling bot:', error);
    return NextResponse.json(
      { error: 'خطا در غیرفعال‌سازی ربات' },
      { status: 500 }
    );
  }
}