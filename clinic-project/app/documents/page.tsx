// app/documents/page.tsx
'use client';

import { useState } from 'react';
import { clinicInfo } from '../components/contect/clinicInfo';
import Image from 'next/image';
import { FileText, BadgeCheck, GraduationCap, CheckCircle, Eye, X } from 'lucide-react';

export default function DocumentsPage() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const documents = [
    {
      id: 1,
      icon: <GraduationCap className="text-[var(--color-primary)]" size={32} />,
      title: 'گواهی مامایی',
      description: 'گواهی تخصصی مامایی از دانشگاه علوم پزشکی اصفهان',
      year: '۱۳۸۵',
      image: '/images/documents/degree.jpg',
    },
    {
      id: 2,
      icon: <BadgeCheck className="text-[var(--color-primary)]" size={32} />,
      title: 'پروانه مامایی',
      description: `شماره پروانه: ${clinicInfo.license}`,
      year: '۱۳۸۶',
      image: '/images/documents/license.jpg',
    },
  ];

  const openLightbox = (image: string) => {
    setLightboxImage(image);
    document.body.style.overflow = 'hidden'; // جلوگیری از اسکرول
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--color-bg-light)] py-16">
        <div className="container max-w-5xl mx-auto px-4">
          {/* هدر صفحه */}
          <div className="text-center mb-16">
            <div className="inline-block bg-[var(--color-primary-lighter)] text-[var(--color-primary)] px-6 py-2 rounded-full text-sm mb-4 font-medium">
              مدارک
            </div>
            <h1 className="text-4xl font-bold mb-4">مدارک و افتخارات</h1>
            <p className="text-[var(--color-text-light)] max-w-2xl mx-auto text-lg leading-relaxed">
              خانم فرشته صادقی، کارشناس مامایی با بیش از {clinicInfo.experience} سال تجربه در زمینه بهداشت زنان و مامایی
            </p>
          </div>

          {/* لیست مدارک */}
          <div className="space-y-8">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="grid md:grid-cols-4 gap-6 p-6">
                  {/* آیکون */}
                  <div className="flex flex-col items-center justify-center p-4 bg-[var(--color-primary-bg)] rounded-2xl">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
                      {doc.icon}
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-sm text-[var(--color-text-light)]">سال</div>
                      <div className="font-bold text-[var(--color-primary)]">{doc.year}</div>
                    </div>
                  </div>

                  {/* اطلاعات */}
                  <div className="md:col-span-3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        {doc.title}
                        <CheckCircle size={18} className="text-green-500" />
                      </h3>
                      <p className="text-[var(--color-text-light)] leading-relaxed">
                        {doc.description}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-4 text-sm text-[var(--color-text-light)]">
                        <div className="flex items-center gap-1">
                          <FileText size={16} />
                          <span>مدرک معتبر</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BadgeCheck size={16} className="text-[var(--color-primary)]" />
                          <span>تأیید شده</span>
                        </div>
                      </div>
                      {/* ============================================================
                          دکمه مشاهده تصویر
                          ============================================================ */}
                      <button
                        onClick={() => openLightbox(doc.image)}
                        className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-5 py-2.5 rounded-full text-sm font-medium transition shadow-md hover:shadow-lg"
                      >
                        <Eye size={18} />
                        مشاهده تصویر
                      </button>
                    </div>
                  </div>
                </div>

                {/* بخش پیش‌نمایش تصویر حذف شد */}
              </div>
            ))}
          </div>

          {/* دکمه بازگشت */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
            >
              ← بازگشت به صفحه اصلی
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================
          Lightbox (بازشو تصویر)
          ============================================================ */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن با کلیک روی خود تصویر
          >
            {/* دکمه بستن (بالا سمت چپ) */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2.5 transition shadow-lg"
              aria-label="بستن"
            >
              <X size={24} />
            </button>

            {/* تصویر */}
            <div className="relative aspect-[16/9] bg-gray-900">
              <Image
                src={lightboxImage}
                alt="مدرک"
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* دکمه بستن در پایین (اختیاری) */}
            <div className="p-4 text-center bg-white">
              <button
                onClick={closeLightbox}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-2.5 rounded-full font-medium transition shadow-md"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* استایل انیمیشن fadeIn */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}