// app/articles/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  User,
  Eye,
  Tag,
  ArrowRight,
  FileText,
  Download,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

// ============================================================
// تایپ‌ها
// ============================================================
type Comment = {
  id: number;
  content: string;
  author: string;
  email?: string;
  createdAt: string;
  isApproved: boolean;
  adminReply?: string;
  user?: {
    name: string;
  };
};

type Article = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image?: string;
  pdfUrl?: string;
  category: string;
  tags?: string;
  author: string;
  views: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
};

// ============================================================
// کامپوننت اصلی
// ============================================================
export default function ArticlePage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State‌های فرم نظر
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState('');

  // ============================================================
  // دریافت مقاله
  // ============================================================
  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/articles/slug/${slug}`);
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 404) {
          setError('مقاله مورد نظر یافت نشد');
        } else {
          setError('خطا در دریافت مقاله');
        }
        return;
      }
      const data = await res.json();
      setArticle(data);
    } catch (error) {
      console.error('❌ Error fetching article:', error);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ثبت نظر
  // ============================================================
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentContent.trim()) {
      setCommentError('نام و متن نظر الزامی است');
      return;
    }

     if (!article) {
    setCommentError('مقاله یافت نشد');
    return;
  }

    setCommentLoading(true);
    setCommentError('');
    setCommentSuccess(false);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article?.id,
          author: commentAuthor,
          email: commentEmail || null,
          content: commentContent,
          userId: session?.user?.id || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCommentSuccess(true);
        setCommentAuthor('');
        setCommentEmail('');
        setCommentContent('');
        // به‌روزرسانی لیست نظرات
        fetchArticle();
        setTimeout(() => setCommentSuccess(false), 5000);
      } else {
        setCommentError(data.error || 'خطا در ثبت نظر');
      }
    } catch (error) {
      console.error('❌ Error submitting comment:', error);
      setCommentError('خطا در ارتباط با سرور');
    } finally {
      setCommentLoading(false);
    }
  };

  // ============================================================
  // محاسبه خواندن مقاله (تخمینی)
  // ============================================================
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes > 1 ? `${minutes} دقیقه` : '۱ دقیقه';
  };

  // ============================================================
  // رندر
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-light)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-light)] px-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold mb-3 text-red-600">{error || 'مقاله یافت نشد'}</h2>
          <p className="text-[var(--color-text-light)] mb-6">
            مقاله مورد نظر شما وجود ندارد یا حذف شده است.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-full hover:shadow-lg transition"
          >
            <ArrowRight size={18} />
            بازگشت به لیست مقالات
          </Link>
        </div>
      </div>
    );
  }

  const tags = article.tags ? article.tags.split(',').map((t) => t.trim()) : [];
  const readingTime = getReadingTime(article.content);
  const hasPdf = article.pdfUrl && article.pdfUrl.trim() !== '';

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] py-8 md:py-16">
      <div className="container max-w-4xl mx-auto px-4">
        {/* ============================================================
            مسیر (Breadcrumb)
            ============================================================ */}
        <nav className="flex items-center gap-2 text-sm text-[var(--color-text-light)] mb-6 overflow-x-auto">
          <Link href="/" className="hover:text-[var(--color-primary)] transition whitespace-nowrap">
            خانه
          </Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-[var(--color-primary)] transition whitespace-nowrap">
            مقالات
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-dark)] truncate">{article.title}</span>
        </nav>

        {/* ============================================================
            کارت مقاله
            ============================================================ */}
        <article className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          {/* تصویر شاخص */}
          {article.image && (
            <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8 lg:p-10">
            {/* ===== هدر مقاله ===== */}
            <div className="mb-6">
              {/* دسته‌بندی */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-block px-4 py-1.5 bg-[var(--color-primary-lighter)] text-[var(--color-primary)] rounded-full text-sm font-medium">
                  {article.category}
                </span>
                {hasPdf && (
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                    <FileText size={16} />
                    دارای PDF
                  </span>
                )}
              </div>

              {/* عنوان */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text-dark)] leading-tight mb-4">
                {article.title}
              </h1>

              {/* متا اطلاعات */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-light)] border-b border-gray-100 pb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  {new Date(article.publishedAt).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <User size={16} />
                  {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={16} />
                  {article.views} بازدید
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle size={16} />
                  {article.comments.filter((c) => c.isApproved).length} نظر
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} />
                  {readingTime} مطالعه
                </span>
              </div>
            </div>

            {/* ===== محتوای مقاله ===== */}
            <div
              className="prose prose-lg max-w-none
                prose-headings:text-[var(--color-text-dark)]
                prose-headings:font-bold
                prose-p:text-[var(--color-text-light)]
                prose-p:leading-relaxed
                prose-a:text-[var(--color-primary)]
                prose-a:no-underline
                hover:prose-a:underline
                prose-strong:text-[var(--color-text-dark)]
                prose-ul:text-[var(--color-text-light)]
                prose-ol:text-[var(--color-text-light)]
                prose-li:text-[var(--color-text-light)]
                prose-blockquote:border-r-[var(--color-primary)]
                prose-blockquote:bg-[var(--color-primary-bg)]
                prose-blockquote:p-4
                prose-blockquote:rounded-2xl
                prose-img:rounded-2xl
                prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* ===== PDF ===== */}
            {hasPdf && (
              <div className="mt-8 p-6 bg-[var(--color-primary-bg)] rounded-2xl border border-[var(--color-primary-lighter)]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-2xl flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-text-dark)]">نسخه PDF مقاله</div>
                      <div className="text-sm text-[var(--color-text-light)]">
                        برای مطالعه آفلاین یا چاپ، فایل PDF را دانلود کنید
                      </div>
                    </div>
                  </div>
                  <a
                    href={article.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-full transition shadow-md hover:shadow-lg"
                  >
                    <Download size={18} />
                    دانلود PDF
                  </a>
                </div>
              </div>
            )}

            {/* ===== تگ‌ها ===== */}
            {tags.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag size={18} className="text-[var(--color-text-light)]" />
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-gray-100 text-[var(--color-text-dark)] rounded-full text-sm hover:bg-[var(--color-primary)] hover:text-white transition cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ===== دکمه بازگشت ===== */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition"
              >
                <ArrowRight size={18} />
                بازگشت به لیست مقالات
              </Link>
            </div>
          </div>
        </article>

        {/* ============================================================
            بخش نظرات
            ============================================================ */}
        <section className="mt-12 bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="text-[var(--color-primary)]" />
            نظرات ({article.comments.filter((c) => c.isApproved).length})
          </h3>

          {/* ===== لیست نظرات تایید شده ===== */}
          {article.comments.filter((c) => c.isApproved).length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-light)]">
              <div className="text-4xl mb-3">💬</div>
              <p>هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {article.comments
                .filter((c) => c.isApproved)
                .map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-[var(--color-text-dark)]">
                          {comment.user?.name || comment.author}
                        </div>
                        <div className="text-xs text-[var(--color-text-light)] mt-0.5">
                          {new Date(comment.createdAt).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-[var(--color-text-light)] mt-3 leading-relaxed">
                      {comment.content}
                    </p>

                    {/* پاسخ ادمین */}
                    {comment.adminReply && (
                      <div className="mt-4 mr-6 bg-[var(--color-primary-bg)] border-r-4 border-[var(--color-primary)] p-4 rounded-xl">
                        <div className="text-sm font-semibold text-[var(--color-primary)] flex items-center gap-2">
                          <User size={16} />
                          پاسخ از طرف مطب
                        </div>
                        <p className="text-[var(--color-text-light)] mt-1 text-sm leading-relaxed">
                          {comment.adminReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* ===== فرم ثبت نظر ===== */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h4 className="text-xl font-bold mb-4">نظر خود را بنویسید</h4>

            {commentSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl mb-6 flex items-center gap-3">
                <CheckCircle size={20} />
                نظر شما با موفقیت ثبت شد و پس از تایید ادمین نمایش داده می‌شود.
              </div>
            )}

            {commentError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3">
                <AlertCircle size={20} />
                {commentError}
              </div>
            )}

            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    نام شما <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder="نام خود را وارد کنید"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ایمیل (اختیاری)</label>
                  <input
                    type="email"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  متن نظر <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={5}
                  placeholder="نظر خود را بنویسید..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none transition resize-none"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-[var(--color-text-light)]">
                  * نظرات پس از تایید ادمین در سایت نمایش داده می‌شوند.
                </p>
                <button
                  type="submit"
                  disabled={commentLoading}
                  className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-8 py-3 rounded-full font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      در حال ثبت...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      ثبت نظر
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}