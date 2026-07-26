// app/components/ui/ArticlesPreview.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, Eye, ArrowLeft } from 'lucide-react'; // ✅ ArrowLeft اضافه شد

export default async function ArticlesPreview() {
  const articles = await prisma.article.findMany({
    take: 3,
    orderBy: { publishedAt: 'desc' },
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
  });

  // اگر مقاله‌ای وجود نداشت، هیچ چیزی نمایش نده
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="section bg-white">
      <div className="container">
        <div className="flex justify-between items-center mb-12">
          <div>
            <div className="inline-block bg-[var(--color-primary-lighter)] text-[var(--color-primary)] px-6 py-2 rounded-full text-sm mb-4 font-medium">
              آخرین مطالب
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text-dark)]">
              مقالات آموزشی
            </h2>
          </div>
          <Link
            href="/articles"
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium flex items-center gap-2 transition-all hover:gap-3"
          >
            مشاهده همه
            <ArrowLeft size={18} />
          </Link>
        </div>

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
                <div className="mt-4 text-[var(--color-primary)] font-medium group-hover:underline transition-all">
                  ادامه مطلب
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}