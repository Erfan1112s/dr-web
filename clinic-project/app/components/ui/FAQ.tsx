// app/components/ui/FAQ.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: "ساعات کاری مطب شما چیست؟", a: "فقط روزهای یکشنبه و سه‌شنبه از ساعت ۴:۳۰ عصر تا ۸:۳۰ شب" },
  { q: "آیا نوبت‌دهی آنلاین دارید؟", a: "بله، می‌توانید از طریق همین سایت نوبت خود را به راحتی رزرو کنید. نوبت‌دهی ۱ تا ۲ روز جلوتر انجام می‌شود." },
  { q: "آیا خدمات تحت پوشش بیمه هستند؟", a: "بله، نسخه و آزمایشات تحت پوشش بیمه قرار می‌گیرند." },
  { q: "نوبت اورژانسی دارید؟", a: "بله، در موارد اورژانسی سعی می‌کنیم در همان روز پذیرش داشته باشیم. لطفاً تماس بگیرید." },
  { q: "آدرس مطب کجاست؟", a: "خمینی‌شهر — خیابان بوعلی، روبروی بانک مسکن، جنب عینک چشم روشن" }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-block bg-[var(--color-primary-lighter)] text-[var(--color-primary)] px-6 py-2 rounded-full text-sm mb-4">
            پرسش‌های متداول
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">سوالات متداول</h2>
          <p className="text-[var(--color-text-light)] max-w-md mx-auto text-lg">
            پاسخ به رایج‌ترین سوالات بیماران عزیز
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 text-right flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-lg text-[var(--color-text-dark)]">{faq.q}</span>
                <ChevronDown
                  size={22}
                  className={`text-[var(--color-primary)] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              <div className={`px-8 overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40 pb-6' : 'max-h-0'}`}>
                <p className="text-[var(--color-text-light)] leading-relaxed border-r-2 border-[var(--color-primary)] pr-4">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}