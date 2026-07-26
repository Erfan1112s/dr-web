// app/dashboard/admin/articles/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Save, X, Upload, FileText } from 'lucide-react';
import { slugify } from '@/lib/slug';

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: '',
    tags: '',
    image: '',
    pdfUrl: '', // ذخیره آدرس PDF
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('لطفاً فقط فایل PDF انتخاب کنید');
        e.target.value = '';
        return;
      }
      setPdfFile(file);
    }
  };

  const uploadPdf = async (): Promise<string | null> => {
    if (!pdfFile) return form.pdfUrl || null;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        return data.url;
      } else {
        alert(data.error || 'خطا در آپلود فایل');
        return null;
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // ابتدا PDF را آپلود کن (اگر انتخاب شده)
    let uploadedPdfUrl = form.pdfUrl;
    if (pdfFile) {
      const url = await uploadPdf();
      if (!url) {
        setLoading(false);
        return;
      }
      uploadedPdfUrl = url;
    }

    // سپس مقاله را ثبت کن
    try {
      const normalizedSlug = slugify(form.slug);
      if (!normalizedSlug) {
        alert('لطفاً یک اسلاگ معتبر وارد کنید');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slug: normalizedSlug,
          pdfUrl: uploadedPdfUrl,
        }),
      });
      if (res.ok) {
        router.push('/dashboard/admin');
      } else {
        const data = await res.json();
        alert(data.error || 'خطا در ثبت مقاله');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold">مقاله جدید</h1>
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

          {/* بخش آپلود PDF */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium mb-2">فایل PDF (اختیاری)</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="flex-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-dark)] transition"
              />
              {pdfFile && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <FileText size={16} />
                  {pdfFile.name}
                </span>
              )}
              {form.pdfUrl && !pdfFile && (
                <span className="text-sm text-blue-600 flex items-center gap-1">
                  <FileText size={16} />
                  <a href={form.pdfUrl} target="_blank" className="underline">مشاهده PDF فعلی</a>
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-light)] mt-2">
              فقط فایل‌های PDF (حداکثر ۵ مگابایت) – پس از آپلود، لینک دانلود در صفحه مقاله نمایش داده می‌شود.
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-3 rounded-full hover:shadow-lg transition disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'در حال ثبت...' : uploading ? 'در حال آپلود...' : 'ثبت مقاله'}
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