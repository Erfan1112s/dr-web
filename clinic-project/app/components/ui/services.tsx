// app/components/ui/Services.tsx
'use client';

import { services } from '../contect/clinicInfo';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Services() {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section id="services" className="section bg-[var(--color-bg-light)]">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-block bg-[var(--color-primary-lighter)] text-[var(--color-primary)] px-6 py-2 rounded-full text-sm mb-4 font-medium">
            خدمات تخصصی
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-[var(--color-text-dark)]">
            خدماتی که ارائه می‌دهیم
          </h2>
          <p className="text-[var(--color-text-light)] max-w-md mx-auto text-lg">
            مراقبت کامل و حرفه‌ای در زمینه بهداشت زنان و مامایی
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[var(--color-primary-lighter)] hover:-translate-y-2"
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors">
                {service.title}
              </h3>
              <p className="text-[var(--color-text-light)] leading-relaxed mb-6">
                {service.shortDesc}
              </p>
              <div className="inline-flex items-center gap-2 text-[var(--color-primary)] font-medium group-hover:gap-3 transition-all">
                بیشتر بدانید
                <ArrowLeft size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-all hover:gap-3"
          >
            مشاهده همه خدمات
            <ArrowLeft size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}