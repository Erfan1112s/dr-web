// app/dashboard/admin/articles/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Save, X } from 'lucide-react';
import { slugify } from '@/lib/slug';

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: '',
    tags: '',
    image: '',
  });

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/articles/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          summary: data.summary || '',
          content: data.content || '',
          category: data.category || '',
          tags: data.tags || '',
          image: data.image || '',
        });
      } else {
        alert('مقاله یافت نشد');
        router.push('/dashboard/admin');
      }
    } catch (error) {
      alert('خطا در دریافت مقاله');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateSlug = () => {
    const slug = form.title
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    setForm({ ...form, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const normalizedSlug = slugify(form.slug);
      if (!normalizedSlug) {
        alert('لطفاً یک اسلاگ معتبر وارد کنید');
        setSubmitting(false);
        return;
      }

      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug: normalizedSlug }),
      });
      if (res.ok) {
        router.push('/dashboard/admin');
      } else {
        const data = await res.json();
        alert(data.error || 'خطا در ویرایش مقاله');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          
          <Link
            href="/dashboard/admin"
            className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition"
          >
            ← بازگشت
          </Link>
          <h1 className="text-3xl font-bold">ویرایش مقاله</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">عنوان مقاله *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                onBlur={generateSlug}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">اسلاگ (آدرس) *</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none"
                required
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">خلاصه مقاله *</label>
            <input
              type="text"
              name="summary"
              value={form.summary}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">متن مقاله *</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none resize-none"
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">دسته‌بندی *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none bg-white"
                required
              >
                <option value="">انتخاب کنید</option>
                <option value="بارداری">بارداری</option>
                <option value="زنان">بیماری‌های زنان</option>
                <option value="IUD">IUD</option>
                <option value="پاپ اسمیر">پاپ اسمیر</option>
                <option value="مشاوره">مشاوره</option>
                <option value="سایر">سایر</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">تگ‌ها</label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="بارداری, سلامتی, مراقبت"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">تصویر (آدرس)</label>
              <input
                type="text"
                name="image"
                value={form.image}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="/images/articles/..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-3 rounded-full hover:shadow-lg transition disabled:opacity-50"
            >
              <Save size={20} />
              {submitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
            <Link
              href="/dashboard/admin"
              className="flex items-center gap-2 border border-gray-300 px-8 py-3 rounded-full hover:bg-gray-50 transition"
            >
              <X size={20} />
              انصراف
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}