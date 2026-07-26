// app/components/ui/Testimonials.tsx
'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'زهرا محمدی',
    text: 'خانم صادقی واقعاً حرفه‌ای و مهربان هستند. تجربه خیلی خوبی داشتم و توصیه می‌کنم.',
    rating: 5,
    date: '۱۴۰۳/۰۴/۱۵',
  },
  {
    id: 2,
    name: 'مریم احمدی',
    text: 'بسیار راضی هستم از نحوه برخورد و دقت در معاینه. قطعاً دوباره مراجعه می‌کنم.',
    rating: 5,
    date: '۱۴۰۳/۰۴/۱۰',
  },
  {
    id: 3,
    name: 'سارا کریمی',
    text: 'محیط مطب آرام و تمیز بود و خانم صادقی با صبر و حوصله به تمام سوالات پاسخ دادند.',
    rating: 5,
    date: '۱۴۰۳/۰۴/۰۵',
  },
];

export default function Testimonials() {
  return (
    <section className="section bg-[var(--color-primary-bg)]">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-block bg-white text-[var(--color-primary)] px-6 py-2 rounded-full text-sm mb-4 font-medium shadow-sm">
            نظرات بیماران
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-[var(--color-text-dark)]">
            تجربه‌های خوب بیماران
          </h2>
          <p className="text-[var(--color-text-light)] max-w-md mx-auto text-lg">
            آنچه بیماران درباره ما می‌گویند
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2"
            >
              <div className="flex items-center gap-1 mb-4 text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <p className="text-[var(--color-text-light)] leading-relaxed mb-6 text-lg italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="font-semibold text-[var(--color-text-dark)]">
                  {testimonial.name}
                </div>
                <div className="text-sm text-[var(--color-text-light)]">
                  {testimonial.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}