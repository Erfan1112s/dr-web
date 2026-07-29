// app/components/ui/Hero.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { clinicInfo } from '@/app/components/contect/clinicInfo';
import { Calendar, PhoneCall, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'مراقبت گرم و حرفه‌ای از شما و فرزندتان',
    subtitle: 'فرشته صادقی، کارشناس مامایی با بیش از ۱۵ سال تجربه',
    image: '/images/hero/slide1.jpg',
    alt: 'مراقبت مامایی و بارداری',
    cta: 'رزرو نوبت آنلاین',
  },
  {
    id: 2,
    title: 'خدمات تخصصی مامایی در فضایی آرام و امن',
    subtitle: 'همراه شما از مشاوره قبل از بارداری تا پس از زایمان',
    image: '/images/hero/slide2.png',
    alt: 'خدمات تخصصی مامایی و زنان',
    cta: 'مشاهده خدمات',
  },
  {
    id: 3,
    title: 'نوبت‌دهی آنلاین و آسان',
    subtitle: 'در کمتر از ۲ دقیقه نوبت خود را ثبت کنید',
    image: '/images/hero/slide3.png',
    alt: 'نوبت‌دهی آنلاین مطب',
    cta: 'ثبت نوبت',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
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
      <div className="relative h-[500px] md:h-[650px] lg:h-[750px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 z-0'
            }`}
          >
            {/* تصویر پس‌زمینه */}
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
              {/* لایه تیره برای خوانایی متن */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* محتوای اسلاید */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container px-4 text-center text-white z-10">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 max-w-3xl mx-auto drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-xl mx-auto drop-shadow-md">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Calendar size={22} />
                    {slide.cta}
                  </button>
                  <a
                    href={`tel:${clinicInfo.phone}`}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/50 px-8 py-4 rounded-full text-lg font-medium transition-all flex items-center gap-2"
                  >
                    <PhoneCall size={22} />
                    تماس فوری
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* ===== دکمه‌های ناوبری ===== */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-3 transition-all backdrop-blur-sm z-20"
          aria-label="اسلاید قبلی"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-3 transition-all backdrop-blur-sm z-20"
          aria-label="اسلاید بعدی"
        >
          <ChevronRight size={28} />
        </button>

        {/* ===== نشانگرهای اسلایدر ===== */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`اسلاید ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}