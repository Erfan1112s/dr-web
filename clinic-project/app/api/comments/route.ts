// app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================
// POST: ثبت نظر جدید
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, author, email, content, userId } = body;

    // اعتبارسنجی
    if (!articleId || !author || !content) {
      return NextResponse.json(
        { error: 'نام، متن نظر و شناسه مقاله الزامی است' },
        { status: 400 }
      );
    }

    // بررسی وجود مقاله
    const article = await prisma.article.findUnique({
      where: { id: parseInt(articleId) },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'مقاله مورد نظر یافت نشد' },
        { status: 404 }
      );
    }

    // ذخیره نظر در دیتابیس
    const comment = await prisma.comment.create({
      data: {
        articleId: parseInt(articleId),
        author,
        email: email || null,
        content,
        userId: userId ? parseInt(userId) : null,
        isApproved: false, // نیاز به تایید ادمین
      },
    });

    return NextResponse.json(
      { success: true, comment, message: 'نظر با موفقیت ثبت شد' },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error in POST /api/comments:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت نظر' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: دریافت نظرات (برای ادمین)
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');

    const where: any = {};
    if (articleId) where.articleId = parseInt(articleId);

    const comments = await prisma.comment.findMany({
      where,
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
    console.error('❌ Error in GET /api/comments:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نظرات' },
      { status: 500 }
    );
  }
}