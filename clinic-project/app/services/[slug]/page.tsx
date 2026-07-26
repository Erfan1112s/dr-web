// app/services/[slug]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { services } from '@/app/components/contect/clinicInfo';
import { ArrowLeft, Calendar, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import { clinicInfo } from '@/app/components/contect/clinicInfo';

export default function ServiceDetailPage() {
  const { slug } = useParams();

  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-light)] px-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-3 text-red-600">خدمت یافت نشد</h2>
          <p className="text-[var(--color-text-light)] mb-6">
            خدمت مورد نظر شما وجود ندارد یا حذف شده است.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-full hover:shadow-lg transition"
          >
            <ArrowLeft size={18} />
            بازگشت به لیست خدمات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      {/* هدر با آیکون و عنوان */}
      <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white py-16 md:py-20">
        <div className="container max-w-4xl mx-auto px-4">
          {/* مسیر */}
          <nav className="flex items-center gap-2 text-sm text-white/80 mb-6 overflow-x-auto">
            <Link href="/" className="hover:text-white transition">خانه</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white transition">خدمات</Link>
            <span>/</span>
            <span className="text-white truncate">{service.title}</span>
          </nav>

          <div className="flex items-center gap-6">
            <div className="text-7xl md:text-8xl bg-white/20 backdrop-blur-sm rounded-3xl p-4">
              {service.icon}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                {service.title}
              </h1>
              <p className="text-lg text-white/90 mt-2 max-w-xl">
                {service.shortDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 md:p-8 lg:p-10">
            {/* توضیحات کامل */}
            <div
              className="prose prose-lg max-w-none
                prose-headings:text-[var(--color-text-dark)]
                prose-headings:font-bold
                prose-p:text-[var(--color-text-light)]
                prose-p:leading-relaxed
                prose-strong:text-[var(--color-text-dark)]
                prose-ul:text-[var(--color-text-light)]
                prose-li:text-[var(--color-text-light)]
                prose-li:leading-relaxed
                prose-li:marker:text-[var(--color-primary)]"
              dangerouslySetInnerHTML={{ __html: service.fullDesc }}
            />

            {/* اطلاعات تماس و رزرو نوبت */}
            <div className="mt-10 grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-[var(--color-primary-bg)] rounded-2xl border border-[var(--color-primary-lighter)]">
                <h3 className="text-lg font-bold mb-4 text-[var(--color-text-dark)] flex items-center gap-2">
                  <Phone className="text-[var(--color-primary)]" size={20} />
                  راه‌های ارتباطی
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-[var(--color-text-light)]">تلفن تماس</div>
                    <a
                      href={`tel:${clinicInfo.phone}`}
                      className="text-xl font-bold text-[var(--color-primary)] hover:underline"
                    >
                      {clinicInfo.phone}
                    </a>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-text-light)]">آدرس</div>
                    <div className="font-medium text-[var(--color-text-dark)] flex items-start gap-2">
                      <MapPin size={18} className="text-[var(--color-primary)] mt-1 flex-shrink-0" />
                      {clinicInfo.address}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-text-light)]">ساعات کاری</div>
                    <div className="font-medium text-[var(--color-text-dark)] flex items-center gap-2">
                      <Clock size={18} className="text-[var(--color-primary)]" />
                      {clinicInfo.hours}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <CheckCircle size={20} />
                    آماده خدمت‌رسانی
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    برای دریافت این خدمت، همین حالا نوبت خود را به صورت آنلاین یا تلفنی ثبت کنید.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/appointment"
                    className="bg-white text-[var(--color-primary)] hover:bg-opacity-90 px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl text-center flex-1 min-w-[140px]"
                  >
                    رزرو نوبت آنلاین
                  </Link>
                  <a
                    href={`tel:${clinicInfo.phone}`}
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[var(--color-primary)] px-6 py-3 rounded-full font-medium transition-all text-center flex-1 min-w-[140px]"
                  >
                    تماس تلفنی
                  </a>
                </div>
              </div>
            </div>

            {/* دکمه بازگشت */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                بازگشت به لیست خدمات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}