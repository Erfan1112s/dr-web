// app/articles/[slug]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  User,
  Eye,
  Tag,
  ArrowLeft,
  FileText,
  Download,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Share2,
  Bookmark,
  Heart,
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
  user?: { name: string };
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
// تابع محاسبه زمان مطالعه
// ============================================================
function getReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes > 1 ? `${minutes} دقیقه` : '۱ دقیقه';
}

// ============================================================
// کامپوننت اصلی
// ============================================================
export default function ArticlePage() {
  const { slug } = useParams();
  const { data: session } = useSession();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

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
        if (res.status === 404) setError('مقاله مورد نظر یافت نشد');
        else setError('خطا در دریافت مقاله');
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
  // پیشرفت خواندن
  // ============================================================
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const totalHeight = rect.height;
      const scrolled = window.scrollY - rect.top + window.innerHeight;
      const progress = Math.min(Math.max((scrolled / totalHeight) * 100, 0), 100);
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

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
          articleId: article.id,
          author: commentAuthor,
          email: commentEmail || null,
          content: commentContent,
          userId: session?.user?.id || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setCommentSuccess(true);
        setCommentAuthor('');
        setCommentEmail('');
        setCommentContent('');
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
            <ArrowLeft size={18} />
            بازگشت به لیست مقالات
          </Link>
        </div>
      </div>
    );
  }

  const tags = article.tags ? article.tags.split(',').map((t) => t.trim()) : [];
  const readingTime = getReadingTime(article.content);
  const hasPdf = article.pdfUrl && article.pdfUrl.trim() !== '';
  const approvedComments = article.comments.filter((c) => c.isApproved);

  // ============================================================
  // رندر اصلی
  // ============================================================
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      {/* ===== نوار پیشرفت خواندن ===== */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] transition-all duration-200"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* ===== هدر مقاله ===== */}
      <div className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          {/* مسیر */}
          <nav className="flex items-center gap-2 text-sm text-white/80 mb-4 overflow-x-auto">
            <Link href="/" className="hover:text-white transition">خانه</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-white transition">مقالات</Link>
            <span>/</span>
            <span className="text-white truncate">{article.title}</span>
          </nav>

          {/* دسته‌بندی */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
              {article.category}
            </span>
            {hasPdf && (
              <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                <FileText size={16} />
                دارای PDF
              </span>
            )}
          </div>

          {/* عنوان */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            {article.title}
          </h1>

          {/* متا اطلاعات */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 mt-4">
            <span className="flex items-center gap-1.5">
              <User size={16} />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={16} />
              {new Date(article.publishedAt).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              {readingTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={16} />
              {article.views} بازدید
            </span>
          </div>
        </div>
      </div>

      {/* ===== محتوای اصلی ===== */}
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <article className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          {/* تصویر شاخص */}
          {article.image && (
            <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6 md:p-8 lg:p-10" ref={contentRef}>
            {/* خلاصه */}
            <div className="bg-[var(--color-primary-bg)] rounded-2xl p-6 mb-8 border-r-4 border-[var(--color-primary)]">
              <p className="text-[var(--color-text-light)] text-lg leading-relaxed">
                {article.summary}
              </p>
            </div>

            {/* محتوای مقاله */}
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

            {/* PDF */}
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

            {/* تگ‌ها */}
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

            {/* اشتراک‌گذاری */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                بازگشت به لیست مقالات
              </Link>
              <div className="flex items-center gap-2">
                <button className="p-2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] rounded-full transition">
                  <Heart size={20} />
                </button>
                <button className="p-2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] rounded-full transition">
                  <Bookmark size={20} />
                </button>
                <button className="p-2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] rounded-full transition">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* ===== بخش نظرات ===== */}
        <section className="mt-12 bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="text-[var(--color-primary)]" />
            نظرات ({approvedComments.length})
          </h3>

          {/* لیست نظرات */}
          {approvedComments.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-light)]">
              <div className="text-4xl mb-3">💬</div>
              <p>هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {approvedComments.map((comment) => (
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
                    <div className="text-[var(--color-primary)] text-sm font-medium">✅ تایید شده</div>
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

          {/* فرم ثبت نظر */}
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