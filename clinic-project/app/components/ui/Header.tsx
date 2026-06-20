// app/components/ui/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { clinicInfo } from '../contect/clinicInfo';
import { Menu, X, Phone } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/90 backdrop-blur-lg shadow-md' : 'bg-white shadow-sm'
    }`}>
      <div className="container flex items-center justify-between py-4">
        {/* لوگو */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollToSection('home')}>
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-110 transition-transform">
            👩‍⚕️
          </div>
          <div>
            <div className="font-bold text-xl text-[var(--color-text-dark)]">خانم دکتر</div>
            <div className="text-sm text-[var(--color-text-light)] -mt-1">کارشناس مامایی</div>
          </div>
        </div>

        {/* منوی دسکتاپ */}
        <nav className="hidden md:flex items-center gap-8">
          {['services', 'about', 'faq', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className="text-[var(--color-text-dark)] hover:text-[var(--color-primary)] font-medium transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-[var(--color-primary)] after:transition-all hover:after:w-full"
            >
              {item === 'services' && 'خدمات'}
              {item === 'about' && 'درباره من'}
              {item === 'faq' && 'سوالات متداول'}
              {item === 'contact' && 'تماس با ما'}
            </button>
          ))}
        </nav>

        {/* دکمه رزرو دسکتاپ */}
        <div className="hidden md:flex items-center gap-4">
          <a href={`tel:${clinicInfo.phone}`} className="flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition">
            <Phone size={18} />
            {clinicInfo.phone}
          </a>
          <button
            onClick={() => scrollToSection('booking')}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:shadow-lg text-white px-8 py-3 rounded-full font-medium transition-all active:scale-95"
          >
            رزرو نوبت
          </button>
        </div>

        {/* دکمه موبایل */}
        <div className="md:hidden flex items-center gap-3">
          <a href={`tel:${clinicInfo.phone}`} className="text-[var(--color-primary)] p-2 bg-[var(--color-primary-lighter)] rounded-full">
            <Phone size={20} />
          </a>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[var(--color-text-dark)]">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* منوی موبایل */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t">
          <div className="container py-6 flex flex-col gap-5 text-lg">
            {['services', 'about', 'faq', 'contact'].map((item) => (
              <button key={item} onClick={() => scrollToSection(item)} className="text-right py-2 border-b border-gray-100">
                {item === 'services' && 'خدمات'}
                {item === 'about' && 'درباره من'}
                {item === 'faq' && 'سوالات متداول'}
                {item === 'contact' && 'تماس با ما'}
              </button>
            ))}
            <Link
             href="/appointment"
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-8 py-3 rounded-full font-medium transition-all"
            >
            رزرو نوبت   
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}