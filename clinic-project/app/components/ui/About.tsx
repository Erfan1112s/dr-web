// app/components/ui/About.tsx
'use client';

import { clinicInfo } from '../contect/clinicInfo';
import { Award, Clock, Heart, Star } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <section id="about" className="section bg-gradient-to-b from-white to-[var(--color-primary-bg)]">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* تصویر با افکت */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-[3rem] rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
            <div className="relative bg-white rounded-[3rem] overflow-hidden shadow-xl">
              <div className="aspect-square bg-gradient-to-br from-[var(--color-primary-lighter)] to-white flex items-center justify-center text-[200px]">
                👩‍⚕️
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl backdrop-blur-sm z-10">
              <div className="flex items-center gap-2">
                <Award className="text-[var(--color-primary)]" size={24} />
                <div>
                  <div className="text-sm text-gray-500">شماره نظام پزشکی</div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">{clinicInfo.license}</div>
                </div>
              </div>
            </div>
          </div>

          {/* متن */}
          <div className="animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full text-[var(--color-primary)] mb-6 shadow-sm border">
              <Heart size={16} />
              درباره من
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              خانم دکتر
              <br />
              <span className="text-gradient">کارشناس مامایی</span>
            </h2>

            <div className="space-y-6 text-[var(--color-text-light)] text-lg leading-relaxed">
              <p>
                با بیش از {clinicInfo.experience} سال تجربه در زمینه مامایی و بهداشت زنان، 
                متعهد به ارائه مراقبت‌های گرم، حرفه‌ای و مبتنی بر شواهد هستم.
              </p>
              <p>
                در مطب خود در خمینی‌شهر، همراه شما در تمام مراحل حساس زندگی‌تان — 
                از مشاوره قبل از بارداری تا مراقبت‌های پس از زایمان — هستم.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-5">
              <div className="bg-white p-5 rounded-2xl shadow-sm flex-1 text-center">
                <Clock className="mx-auto text-[var(--color-primary)] mb-2" size={28} />
                <div className="font-semibold">ساعت کاری</div>
                <div className="text-sm text-[var(--color-text-light)]">{clinicInfo.hours}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm flex-1 text-center">
                <Star className="mx-auto text-[var(--color-primary)] mb-2" size={28} />
                <div className="font-semibold">بیمارستان‌های همکار</div>
                <div className="text-sm text-[var(--color-text-light)]">{clinicInfo.hospitals.join('، ')}</div>
              </div>
            </div>

            <Link
              href="/appointment"
              className="mt-10 inline-block bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white px-10 py-4 rounded-full text-lg font-medium transition-all hover:shadow-xl active:scale-95"
            >
              رزرو نوبت و مشاوره
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}