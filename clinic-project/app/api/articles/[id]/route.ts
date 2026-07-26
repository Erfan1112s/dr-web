// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ============================================================
// GET: دریافت یک مقاله
// ============================================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id: idStr } = await params; 
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'شناسه نامعتبر' }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'مقاله یافت نشد' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('❌ Error in GET /api/articles/[id]:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مقاله' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT: ویرایش مقاله
// ============================================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { id: idStr } = await params; 
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'شناسه نامعتبر' }, { status: 400 });
    }

    const body = await req.json();
    const { title, slug, summary, content, category, tags, image, pdfUrl } = body;

    if (!title || !slug || !summary || !content || !category) {
      return NextResponse.json(
        { error: 'فیلدهای اجباری را پر کنید' },
        { status: 400 }
      );
    }

    // بررسی یکتا بودن slug (به جز خود مقاله)
    const existing = await prisma.article.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'این اسلاگ قبلاً استفاده شده است' },
        { status: 409 }
      );
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        summary,
        content,
        category,
        tags: tags || null,
        image: image || null,
        pdfUrl: pdfUrl || null,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('❌ Error in PUT /api/articles/[id]:', error);
    return NextResponse.json(
      { error: 'خطا در ویرایش مقاله' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE: حذف مقاله
// ============================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { id: idStr } = await params; 
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'شناسه نامعتبر' }, { status: 400 });
    }

    // بررسی وجود مقاله
    const article = await prisma.article.findUnique({
      where: { id },
    });
    if (!article) {
      return NextResponse.json({ error: 'مقاله یافت نشد' }, { status: 404 });
    }

    // حذف نظرات مرتبط
    await prisma.comment.deleteMany({
      where: { articleId: id },
    });

    // حذف مقاله
    await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error in DELETE /api/articles/[id]:', error);
    return NextResponse.json(
      { error: 'خطا در حذف مقاله' },
      { status: 500 }
    );
  }
}