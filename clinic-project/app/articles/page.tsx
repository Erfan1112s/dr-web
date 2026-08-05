// app/articles/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, Clock, Search, Tag, ArrowLeft } from 'lucide-react';

function getReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes > 1 ? `${minutes} دقیقه` : '۱ دقیقه';
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; search?: string }>;
}) {
  
  const params = await searchParams;
  const category = params.category || '';
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const limit = 6;
  const skip = (page - 1) * limit;

  // ساخت شرط جستجو
  const where: any = {};
  if (category) where.category = category;
  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  // دریافت داده‌ها
  const [articles, total, categories, popularArticles] = await Promise.all([
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
    prisma.article.findMany({
      select: { category: true },
      distinct: ['category'],
    }),
    prisma.article.findMany({
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        views: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      {/* هدر */}
      <div className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container max-w-6xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm mb-4 font-medium">
            مجله سلامت
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            مقالات آموزشی
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            مطالب مفید و علمی در زمینه مامایی، بارداری، سلامت زنان و مراقبت‌های پس از زایمان
          </p>

          {/* فرم جستجو */}
          <div className="mt-8 max-w-xl mx-auto">
            <form method="GET" className="relative">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="جستجو در مقالات..."
                className="w-full px-6 py-4 pr-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
              >
                <Search size={22} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* ستون اصلی */}
          <div className="flex-1">
            {/* فیلتر دسته‌بندی */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <Link
                href={`/articles${search ? `?search=${encodeURIComponent(search)}` : ''}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  !category
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-100 border border-gray-200'
                }`}
              >
                همه
              </Link>
              {categories.map(({ category: cat }) => (
                <Link
                  key={cat}
                  href={`/articles?category=${encodeURIComponent(cat)}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    category === cat
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* نمایش عبارت جستجو */}
            {search && (
              <div className="mb-6 text-[var(--color-text-light)] flex flex-wrap items-center gap-2">
                <span>نتیجه جستجو برای:</span>
                <span className="font-bold text-[var(--color-text-dark)]">"{search}"</span>
                <span className="text-sm text-gray-400">•</span>
                <Link
                  href="/articles"
                  className="text-[var(--color-primary)] hover:underline text-sm"
                >
                  حذف فیلتر
                </Link>
              </div>
            )}

            {/* لیست مقالات */}
            {articles.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2 text-[var(--color-text-dark)]">نتیجه‌ای یافت نشد</h3>
                <p className="text-[var(--color-text-light)]">
                  {search
                    ? `با عبارت "${search}" مقاله‌ای پیدا نشد. لطفاً عبارت دیگری را جستجو کنید.`
                    : 'هیچ مقاله‌ای منتشر نشده است.'}
                </p>
                {search && (
                  <Link
                    href="/articles"
                    className="inline-block mt-6 text-[var(--color-primary)] hover:underline"
                  >
                    ← مشاهده همه مقالات
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                  >
                    <div className="grid md:grid-cols-3 gap-0">
                      <div className="relative h-56 md:h-full min-h-[200px] bg-gray-100 overflow-hidden">
                        {article.image ? (
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--color-primary-lighter)] flex items-center justify-center text-6xl">
                            📄
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-[var(--color-primary)] rounded-full text-xs font-medium shadow-sm">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="md:col-span-2 p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-light)] mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(article.publishedAt).toLocaleDateString('fa-IR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {getReadingTime(article.content)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={14} />
                              {article.views} بازدید
                            </span>
                          </div>
                          <Link href={`/articles/${article.slug}`}>
                            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                              {article.title}
                            </h2>
                          </Link>
                          <p className="text-[var(--color-text-light)] leading-relaxed line-clamp-2">
                            {article.summary}
                          </p>
                        </div>
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3 text-sm text-[var(--color-text-light)]">
                            <span className="font-medium text-[var(--color-text-dark)]">
                              {article.author}
                            </span>
                          </div>
                          <Link
                            href={`/articles/${article.slug}`}
                            className="inline-flex items-center gap-2 text-[var(--color-primary)] font-medium hover:gap-3 transition-all"
                          >
                            ادامه مطلب
                            <ArrowLeft size={16} className="group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* صفحه‌بندی */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => {
                  const params = new URLSearchParams();
                  if (category) params.set('category', category);
                  if (search) params.set('search', search);
                  params.set('page', String(p));

                  return (
                    <Link
                      key={p}
                      href={`/articles?${params.toString()}`}
                      className={`px-4 py-2 rounded-lg transition ${
                        p === page
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* سایدبار */}
          <div className="lg:w-80 flex-shrink-0 space-y-8">
            {/* مقالات محبوب */}
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-[var(--color-text-dark)] flex items-center gap-2">
                 محبوب‌ترین‌ها
              </h3>
              {popularArticles.length === 0 ? (
                <p className="text-[var(--color-text-light)] text-sm">هنوز مقاله‌ای وجود ندارد</p>
              ) : (
                <div className="space-y-4">
                  {popularArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="flex items-center gap-3 group hover:bg-[var(--color-primary-bg)] p-2 rounded-xl transition"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {article.image ? (
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--color-primary-lighter)] flex items-center justify-center text-2xl">
                            📄
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition line-clamp-2">
                          {article.title}
                        </h4>
                        <div className="text-xs text-[var(--color-text-light)] flex items-center gap-1 mt-1">
                          <Eye size={12} />
                          {article.views} بازدید
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* دسته‌بندی‌ها */}
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-[var(--color-text-dark)] flex items-center gap-2">
                <Tag size={20} className="text-[var(--color-primary)]" />
                دسته‌بندی‌ها
              </h3>
              {categories.length === 0 ? (
                <p className="text-[var(--color-text-light)] text-sm">دسته‌بندی وجود ندارد</p>
              ) : (
                <div className="space-y-2">
                  {categories.map(({ category: cat }) => (
                    <Link
                      key={cat}
                      href={`/articles?category=${encodeURIComponent(cat)}`}
                      className="flex items-center justify-between px-4 py-2 bg-[var(--color-bg-light)] rounded-xl hover:bg-[var(--color-primary-lighter)] transition group"
                    >
                      <span className="text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition">
                        {cat}
                      </span>
                      <span className="text-xs text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* دکمه بازگشت به صفحه اصلی */}
            <Link
              href="/"
              className="block bg-white rounded-3xl shadow-sm p-6 border border-gray-100 text-center hover:shadow-md transition group"
            >
              <span className="text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition flex items-center justify-center gap-2">
                ← بازگشت به صفحه اصلی
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}