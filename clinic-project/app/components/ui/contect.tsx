// app/components/ui/Contact.tsx
'use client';

import { clinicInfo } from '../contect/clinicInfo';
import { MapPin, Phone, Clock, Calendar, CheckCircle } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="section bg-gradient-to-b from-white to-[var(--color-primary-bg)]">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-block bg-[var(--color-primary-lighter)] text-[var(--color-primary)] px-6 py-2 rounded-full text-sm mb-4">
            اطلاعات تماس
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">در تماس باشیم</h2>
          <p className="text-[var(--color-text-light)] max-w-md mx-auto text-lg">
            برای رزرو نوبت یا مشاوره با ما در ارتباط باشید
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* اطلاعات تماس */}
          <div className="space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-[var(--color-primary)] rounded-full"></span>
                اطلاعات مطب
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <div className="font-semibold mb-1 text-lg">آدرس</div>
                    <div className="text-[var(--color-text-light)] leading-relaxed">{clinicInfo.address}</div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Phone size={22} />
                  </div>
                  <div>
                    <div className="font-semibold mb-1 text-lg">تلفن تماس</div>
                    <a href={`tel:${clinicInfo.phone}`} className="text-2xl font-bold text-[var(--color-primary)] hover:underline">
                      {clinicInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Clock size={22} />
                  </div>
                  <div>
                    <div className="font-semibold mb-1 text-lg">ساعات کاری</div>
                    <div className="text-[var(--color-text-light)] text-lg">{clinicInfo.hours}</div>
                  </div>
                </div>
              </div>
            </div>

            <div id="booking" className="pt-6 border-t border-gray-200">
              <a
                href={`tel:${clinicInfo.phone}`}
                className="block w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:shadow-xl text-white text-center py-6 rounded-2xl text-xl font-medium transition-all active:scale-[0.98]"
              >
                رزرو نوبت تلفنی (همین حالا)
              </a>
              <div className="flex items-center justify-center gap-2 mt-5 text-sm text-[var(--color-text-light)]">
                <CheckCircle size={16} className="text-green-500" />
                نوبت‌دهی ۱ تا ۲ روز جلوتر
              </div>
            </div>
          </div>

          {/* نقشه */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10"></div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl h-full min-h-[420px] flex items-center justify-center border border-gray-200 relative z-10">
              <div className="text-center p-8">
                <div className="text-7xl mb-6 animate-float inline-block">📍</div>
                <div className="text-2xl font-bold mb-3 text-[var(--color-text-dark)]">موقعیت مطب</div>
                <div className="text-[var(--color-text-light)] max-w-xs mx-auto leading-relaxed">
                  خمینی‌شهر — خیابان بوعلی، روبروی بانک مسکن
                </div>
                <div className="mt-8 text-sm text-[var(--color-primary)] font-medium">
                  نقشه گوگل در نسخه نهایی embed خواهد شد
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}