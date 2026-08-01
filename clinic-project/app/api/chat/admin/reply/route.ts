// app/api/chat/admin/reply/route.ts
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

    const { messageId, reply } = await req.json();

    if (!messageId || !reply) {
      return NextResponse.json(
        { error: 'شناسه پیام و پاسخ الزامی است' },
        { status: 400 }
      );
    }

    const updated = await prisma.chatMessage.update({
      where: { id: parseInt(messageId) },
      data: { adminReply: reply },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ Error in admin reply:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال پاسخ' },
      { status: 500 }
    );
  }
}