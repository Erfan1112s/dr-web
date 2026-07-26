// app/services/page.tsx
import { services } from '@/app/components/contect/clinicInfo';
import Link from 'next/link';
import { ArrowLeft, Calendar, Phone } from 'lucide-react';
import { clinicInfo } from '@/app/components/contect/clinicInfo';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      {/* هدر صفحه با تصویر پس‌زمینه */}
      <div className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white py-20 md:py-28">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm mb-4 font-medium">
            خدمات تخصصی
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            همه خدمات
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            مراقبت کامل و حرفه‌ای در زمینه مامایی، زنان، نازایی، سونوگرافی، آزمایشات و واکسیناسیون
          </p>
        </div>
      </div>

      {/* لیست خدمات */}
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[var(--color-primary-lighter)] hover:-translate-y-3 group"
            >
              {/* بخش بالایی با آیکون و رنگ پس‌زمینه */}
              <div className="bg-[var(--color-primary-bg)] p-8 text-center border-b border-gray-100 group-hover:bg-[var(--color-primary-lighter)] transition-colors duration-300">
                <div className="text-7xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors">
                  {service.title}
                </h3>
              </div>

              {/* بخش پایینی با توضیحات */}
              <div className="p-6">
                <p className="text-[var(--color-text-light)] leading-relaxed text-center">
                  {service.shortDesc}
                </p>
                <div className="mt-6 flex justify-center">
                  <span className="inline-flex items-center gap-2 text-[var(--color-primary)] font-medium group-hover:gap-3 transition-all">
                    بیشتر بدانید
                    <ArrowLeft size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* اطلاعات تماس در پایین */}
        <div className="mt-16 bg-white rounded-3xl shadow-lg p-8 border border-gray-100 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div>
              <div className="text-sm text-[var(--color-text-light)]">برای مشاوره و رزرو نوبت</div>
              <a
                href={`tel:${clinicInfo.phone}`}
                className="text-2xl font-bold text-[var(--color-primary)] hover:underline flex items-center gap-2 justify-center"
              >
                <Phone size={22} />
                {clinicInfo.phone}
              </a>
            </div>
            <div className="w-px h-12 bg-gray-200 hidden md:block" />
            <div>
              <div className="text-sm text-[var(--color-text-light)]">ساعات کاری</div>
              <div className="font-semibold text-[var(--color-text-dark)] flex items-center gap-2 justify-center">
                <Calendar size={18} className="text-[var(--color-primary)]" />
                {clinicInfo.hours}
              </div>
            </div>
            <div className="w-px h-12 bg-gray-200 hidden md:block" />
            <Link
              href="/appointment"
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:shadow-lg text-white px-8 py-3 rounded-full font-medium transition-all active:scale-95"
            >
              رزرو نوبت
            </Link>
          </div>
        </div>

        {/* دکمه بازگشت */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition"
          >
            ← بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}