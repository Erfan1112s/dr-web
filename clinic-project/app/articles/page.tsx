// app/articles/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Eye, Search } from 'lucide-react';

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const category = searchParams.category || '';
  const page = parseInt(searchParams.page || '1');
  const limit = 9;
  const skip = (page - 1) * limit;

  const where = category ? { category } : {};

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
      },
    }),
    prisma.article.count({ where }),
  ]);

  const categories = await prisma.article.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] py-16">
      <div className="container max-w-6xl mx-auto px-4">
        {/* هدر */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[var(--color-primary-lighter)] text-[var(--color-primary)] px-6 py-2 rounded-full text-sm mb-4 font-medium">
            مجله سلامت
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-text-dark)]">
            مقالات آموزشی
          </h1>
          <p className="text-[var(--color-text-light)] max-w-2xl mx-auto text-lg">
            مطالب مفید و علمی در زمینه مامایی، بارداری، سلامت زنان و مراقبت‌های پس از زایمان
          </p>
        </div>

        {/* فیلتر دسته‌بندی */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <Link
            href="/articles"
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
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
              href={`/articles?category=${encodeURIComponent(cat)}`}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                category === cat
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* لیست مقالات */}
        {articles.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-text-light)]">
            <div className="text-6xl mb-4">📝</div>
            <p>هیچ مقاله‌ای در این دسته‌بندی یافت نشد</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2"
              >
                <div className="aspect-[16/10] bg-[var(--color-primary-lighter)] flex items-center justify-center text-6xl">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    '📄'
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-sm text-[var(--color-text-light)] mb-3">
                    <span className="inline-block px-3 py-1 bg-[var(--color-primary-lighter)] text-[var(--color-primary)] rounded-full text-xs">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(article.publishedAt).toLocaleDateString('fa-IR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {article.views}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-[var(--color-text-light)] text-sm line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="mt-4 text-[var(--color-primary)] font-medium group-hover:underline transition-all inline-flex items-center gap-1">
                    ادامه مطلب
                    <span className="group-hover:translate-x-1 transition-transform">←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/articles?page=${p}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                className={`px-4 py-2 rounded-lg transition ${
                  p === page
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}