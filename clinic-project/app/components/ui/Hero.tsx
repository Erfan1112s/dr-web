// app/components/ui/Hero.tsx
'use client';

import { useState, useEffect } from 'react';
import { clinicInfo } from '../contect/clinicInfo';
import { Calendar, PhoneCall, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'مراقبت گرم و حرفه‌ای از شما و فرزندتان',
    subtitle: 'زهره بصارت، کارشناس مامایی با بیش از ۱۵ سال تجربه',
    image: '👩‍⚕️',
    bg: 'from-[var(--color-primary)] to-[var(--color-primary-light)]',
  },
  {
    id: 2,
    title: 'خدمات تخصصی مامایی در فضایی آرام و امن',
    subtitle: 'همراه شما از مشاوره قبل از بارداری تا پس از زایمان',
    image: '🤱',
    bg: 'from-[var(--color-primary-light)] to-[var(--color-primary)]',
  },
  {
    id: 3,
    title: 'نوبت‌دهی آنلاین و آسان',
    subtitle: 'در کمتر از ۲ دقیقه نوبت خود را ثبت کنید',
    image: '📅',
    bg: 'from-[var(--color-primary-dark)] to-[var(--color-primary)]',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[600px] md:h-[700px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            <div className={`w-full h-full bg-gradient-to-br ${slide.bg} flex items-center justify-center`}>
              <div className="container px-4 text-center text-white">
                <div className="text-8xl md:text-9xl mb-6 animate-float">{slide.image}</div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 max-w-3xl mx-auto">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-xl mx-auto">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-[var(--color-primary)] hover:bg-opacity-90 px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Calendar size={22} />
                    رزرو نوبت آنلاین
                  </button>
                  <a
                    href={`tel:${clinicInfo.phone}`}
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[var(--color-primary)] px-8 py-4 rounded-full text-lg font-medium transition-all flex items-center gap-2"
                  >
                    <PhoneCall size={22} />
                    تماس فوری
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* دکمه‌های ناوبری اسلایدر */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-all backdrop-blur-sm z-10"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-all backdrop-blur-sm z-10"
        >
          <ChevronRight size={28} />
        </button>

        {/* نشانگرهای اسلایدر */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}