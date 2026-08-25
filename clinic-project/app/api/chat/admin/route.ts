// app/api/chat/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ============================================================
// GET: دریافت پیام‌های چت برای ادمین با گروه‌بندی و مرتب‌سازی
// ============================================================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    // دریافت آخرین ۱۰۰ پیام
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    // گروه‌بندی بر اساس sessionId
    const groups: Record<string, any[]> = {};
    for (const msg of messages) {
      if (!groups[msg.sessionId]) {
        groups[msg.sessionId] = [];
      }
      groups[msg.sessionId].push(msg);
    }

    // مرتب‌سازی و تبدیل به آرایه
    const groupedMessages = Object.keys(groups).map((sessionId) => {
      const msgs = groups[sessionId];

      // مرتب‌سازی صعودی داخل هر مکالمه (قدیمی → جدید)
      msgs.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const lastMsg = msgs[msgs.length - 1] || {};
      const user = lastMsg.user || msgs[0]?.user;

      return {
        sessionId,
        userId: user?.id || null,
        userName: user?.name || 'کاربر مهمان',
        userPhone: user?.phone || '-',
        messages: msgs, // مرتب از قدیم به جدید
        lastMessage: lastMsg.userMsg || '',
        createdAt: lastMsg.createdAt || new Date().toISOString(),
        isRead: msgs.some((m: any) => m.isRead),
        hasAdminReply: msgs.some((m: any) => m.adminReply !== null && m.adminReply !== ''),
        botDisabled: msgs.some((m: any) => m.botDisabled === true),
      };
    });

    return NextResponse.json(
      {
        total: messages.length,
        groups: groupedMessages,
        messages,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error fetching chat messages for admin:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پیام‌ها' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT: علامت‌گذاری پیام‌ها به عنوان خوانده شده
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'آیدی‌های نامعتبر' },
        { status: 400 }
      );
    }

    await prisma.chatMessage.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی وضعیت خوانده شده' },
      { status: 500 }
    );
  }
}