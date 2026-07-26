// app/api/articles/slug/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================
// GET: دریافت یک مقاله بر اساس اسلاگ
// ============================================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. دریافت slug از params (با await چون Promise است)
    const { slug } = await params;

    // 2. جستجوی مقاله در دیتابیس
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // 3. اگر مقاله یافت نشد، خطای 404 برگردان
    if (!article) {
      return NextResponse.json(
        { error: 'مقاله مورد نظر یافت نشد' },
        { status: 404 }
      );
    }

    // 4. افزایش تعداد بازدید (به‌صورت غیرهمزمان)
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    // 5. پاسخ موفق
    return NextResponse.json(article);
  } catch (error) {
    console.error('❌ Error in GET /api/articles/slug/[slug]:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مقاله' },
      { status: 500 }
    );
  }
}