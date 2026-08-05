// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    
    
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          image: true,
          category: true,
          views: true,
          publishedAt: true,
          content: true,
          author: true,
          tags: true,
        },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({ articles, total, page, limit });
  } catch (error) {
    console.error('❌ Error in GET /api/articles:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مقالات' },
      { status: 500 }
    );
  }
}

// POST: ...

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const { title, slug, summary, content, category, tags, image, pdfUrl } = body;

    if (!title || !slug || !summary || !content || !category) {
      return NextResponse.json(
        { error: 'فیلدهای اجباری را پر کنید' },
        { status: 400 }
      );
    }

    // بررسی یکتا بودن slug
    const existing = await prisma.article.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'این اسلاگ قبلاً استفاده شده است' },
        { status: 409 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        summary,
        content,
        category,
        tags: tags || null,
        image: image || null,
        pdfUrl: pdfUrl || null,
        author: session.user.name || 'مدیر',
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('❌ Error in POST /api/articles:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت مقاله' },
      { status: 500 }
    );
  }
}