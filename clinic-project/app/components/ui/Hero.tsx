// app/components/Hero.tsx
'use client';

import { clinicInfo } from '../contect/clinicInfo';
import Link from 'next/link';


export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[var(--color-primary-lighter)] to-white pt-20 pb-16">
      <div className="container grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block bg-white rounded-full px-5 py-2 text-sm text-[var(--color-primary)] mb-6 font-medium border border-[var(--color-primary-light)]">
            خمینی‌شهر • اصفهان
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-[var(--color-text-dark)]">
            مراقبت گرم و حرفه‌ای<br />از شما و فرزندتان
          </h1>
          
          <p className="text-xl text-[var(--color-text-light)] mb-10 max-w-md">
                        فرشته صادقی، کارشناس مامایی با بیش از ۱۵ سال تجربه
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/appointment"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-10 py-4 rounded-full text-lg font-medium transition-all active:scale-95 shadow-lg"
            >
              رزرو نوبت آنلاین
            </Link>
            
            <a 
              href={`tel:${clinicInfo.phone}`}
              className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-8 py-4 rounded-full text-lg font-medium transition-all"
            >
              تماس فوری
            </a>
          </div>

          <div className="flex gap-10 mt-12">
            <div>
              <div className="text-4xl font-bold text-[var(--color-primary)]">{clinicInfo.experience}</div>
              <div className="text-sm text-[var(--color-text-light)]">سال تجربه</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-primary)]">{clinicInfo.patients}+</div>
              <div className="text-sm text-[var(--color-text-light)]">بیمار راضی</div>
            </div>
          </div>
        </div>

        {/* تصویر هیرو */}
        <div className="relative hidden md:block">
          <div className="aspect-square bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-[3rem] flex items-center justify-center text-[180px] opacity-90">
            👩‍🍼
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">نوبت اورژانسی موجود</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}