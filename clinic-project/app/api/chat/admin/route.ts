// app/api/chat/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: دریافت همه مکالمات (با فیلتر)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (userId) where.userId = parseInt(userId);
    if (sessionId) where.sessionId = sessionId;

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // گروه‌بندی بر اساس sessionId
    const groupedMessages: Record<string, any[]> = {};
    for (const msg of messages) {
      if (!groupedMessages[msg.sessionId]) {
        groupedMessages[msg.sessionId] = [];
      }
      groupedMessages[msg.sessionId].push(msg);
    }

    return NextResponse.json({
      total: messages.length,
      groups: groupedMessages,
      messages,
    });
  } catch (error) {
    console.error('❌ Error fetching chat messages:', error);
    return NextResponse.json({ error: 'خطا در دریافت پیام‌ها' }, { status: 500 });
  }
}

// PUT: به‌روزرسانی وضعیت خوانده شده
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'آیدی‌های نامعتبر' }, { status: 400 });
    }

    await prisma.chatMessage.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی وضعیت' }, { status: 500 });
  }
}