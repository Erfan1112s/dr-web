// app/api/comments/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ============================================================
// GET: دریافت همه نظرات (برای ادمین)
// ============================================================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          select: { title: true, slug: true },
        },
        user: {
          select: { name: true, phone: true },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('❌ Error fetching comments for admin:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نظرات' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT: تایید یا رد نظر
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const { id, isApproved, adminReply } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'شناسه نظر الزامی است' },
        { status: 400 }
      );
    }

    const data: any = {};
    if (isApproved !== undefined) data.isApproved = isApproved;
    if (adminReply !== undefined) data.adminReply = adminReply;

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('❌ Error updating comment:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی نظر' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE: حذف نظر
// ============================================================
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'شناسه نظر الزامی است' },
        { status: 400 }
      );
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    return NextResponse.json(
      { error: 'خطا در حذف نظر' },
      { status: 500 }
    );
  }
}