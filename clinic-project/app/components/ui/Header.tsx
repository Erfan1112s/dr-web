// app/components/ui/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Phone, 
  Calendar, 
  User, 
  LogOut, 
  LogIn,
  UserPlus,
  ChevronDown
} from 'lucide-react';
import { clinicInfo } from '../contect/clinicInfo';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    setIsUserMenuOpen(false);
  };

  const navItems = [
    { id: 'services', label: 'خدمات' },
    { id: 'about', label: 'درباره من' },
    { id: 'faq', label: 'سوالات متداول' },
    { id: 'contact', label: 'تماس با ما' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-lg shadow-md' 
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="container flex items-center justify-between py-3 md:py-4">
        {/* لوگو */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
            👩‍⚕️
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-lg md:text-xl text-[var(--color-text-dark)] leading-tight">
              {clinicInfo.name}
            </div>
            <div className="text-xs md:text-sm text-[var(--color-text-light)] -mt-0.5">
              {clinicInfo.title}
            </div>
          </div>
        </Link>

        {/* منوی دسکتاپ */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-[var(--color-text-dark)] hover:text-[var(--color-primary)] font-medium transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-[var(--color-primary)] after:transition-all hover:after:w-full text-sm xl:text-base"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* بخش راست (دکمه‌ها) */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* شماره تلفن (دسکتاپ) */}
          <a
            href={`tel:${clinicInfo.phone}`}
            className="hidden lg:flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition text-sm xl:text-base"
          >
            <Phone size={18} />
            {clinicInfo.phone}
          </a>

          {/* دکمه رزرو نوبت (دسکتاپ) */}
          <Link
            href="/appointment"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:shadow-lg text-white px-5 py-2.5 rounded-full font-medium transition-all active:scale-95 text-sm xl:text-base"
          >
            <Calendar size={18} />
            رزرو نوبت
          </Link>

          {/* دکمه ورود / پروفایل کاربر */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-[var(--color-text-dark)] hover:text-[var(--color-primary)] transition p-2 rounded-full hover:bg-[var(--color-primary-lighter)]"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* منوی کاربری dropdown */}
              {isUserMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium text-[var(--color-text-dark)]">
                      {session.user?.name}
                    </div>
                    <div className="text-xs text-[var(--color-text-light)]">
                      {isAdmin ? 'مدیر سیستم' : 'بیمار'}
                    </div>
                  </div>
                  
                  <Link
                    href={isAdmin ? '/dashboard/admin' : '/dashboard'}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-primary-lighter)] transition-colors text-sm"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={16} className="text-[var(--color-primary)]" />
                    {isAdmin ? 'پنل مدیریت' : 'پنل کاربری'}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-sm text-red-600 w-full text-right"
                  >
                    <LogOut size={16} />
                    خروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-5 py-2 rounded-full text-sm xl:text-base"
            >
              <LogIn size={18} />
              ورود / ثبت‌نام
            </Link>
          )}

          {/* دکمه منوی موبایل */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-[var(--color-text-dark)] p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="منو"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* منوی موبایل (کشویی) */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-lg animate-fadeInUp">
          <div className="container py-6 flex flex-col gap-1">
            {/* آیتم‌های منو */}
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-right py-3 px-4 hover:bg-[var(--color-primary-lighter)] rounded-xl transition-colors text-[var(--color-text-dark)] font-medium"
              >
                {item.label}
              </button>
            ))}

            <div className="border-t border-gray-100 my-2"></div>

            {/* دکمه رزرو نوبت (موبایل) */}
            <Link
              href="/appointment"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white py-4 rounded-2xl font-medium transition mt-2"
            >
              <Calendar size={20} />
              رزرو نوبت آنلاین
            </Link>

            {/* شماره تماس (موبایل) */}
            <a
              href={`tel:${clinicInfo.phone}`}
              className="flex items-center justify-center gap-2 text-[var(--color-primary)] border-2 border-[var(--color-primary)] py-4 rounded-2xl font-medium transition hover:bg-[var(--color-primary)] hover:text-white mt-2"
            >
              <Phone size={20} />
              تماس با مطب
            </a>

            {/* دکمه ورود/ثبت‌نام (موبایل) */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 text-red-500 border-2 border-red-200 py-4 rounded-2xl font-medium transition hover:bg-red-50 mt-2"
              >
                <LogOut size={20} />
                خروج از حساب
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 text-[var(--color-primary)] border-2 border-[var(--color-primary-lighter)] py-4 rounded-2xl font-medium transition hover:bg-[var(--color-primary)] hover:text-white mt-2"
              >
                <LogIn size={20} />
                ورود / ثبت‌نام
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}