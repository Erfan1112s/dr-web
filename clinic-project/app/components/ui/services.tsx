// app/components/ui/Services.tsx
'use client';

import { services } from '../contect/clinicInfo';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function Services() {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section id="services" className="section bg-[var(--color-bg-light)]">
      <div className="container">
        {/* عنوان بخش */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block bg-[var(--color-primary-lighter)] text-[var(--color-primary)] px-6 py-2 rounded-full text-sm mb-4 font-medium">
            خدمات تخصصی
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[var(--color-text-dark)]">
            خدماتی که ارائه می‌دهیم
          </h2>
          <p className="text-[var(--color-text-light)] max-w-2xl mx-auto text-base md:text-lg">
            مراقبت کامل و حرفه‌ای در زمینه مامایی، زنان، نازایی، سونوگرافی، آزمایشات و واکسیناسیون
          </p>
        </div>


        {/* لیست خدمات با عکس */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[var(--color-primary-lighter)] hover:-translate-y-2"
            >
              {/* عکس بالای کارت */}
              <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-[var(--color-primary-bg)]">
                    {service.icon}
                  </div>
                )}
                {/* برچسب دسته‌بندی روی عکس (اختیاری) */}
                <div className="absolute top-3 right-3 bg-[var(--color-primary)] text-white text-xs px-3 py-1 rounded-full">
                  {service.category || 'تخصصی'}
                </div>
              </div>

              {/* متن پایین کارت */}
              <div className="p-5 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors">
                  {service.title}
                </h3>
                <p className="text-[var(--color-text-light)] text-sm md:text-base leading-relaxed line-clamp-2">
                  {service.shortDesc}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-[var(--color-primary)] font-medium text-sm group-hover:gap-3 transition-all">
                  بیشتر بدانید
                  <ArrowLeft size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* دکمه مشاهده همه خدمات */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-all hover:gap-3 border-2 border-[var(--color-primary)] px-6 py-3 rounded-full hover:bg-[var(--color-primary)] hover:text-white"
          >
            مشاهده همه خدمات
            <ArrowLeft size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}