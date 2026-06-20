// app/components/ui/Footer.tsx
import { clinicInfo } from '@/app/components/contect/clinicInfo';
import { Heart, Phone, MapPin, Clock, Mail, MessageCircle, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-text-dark)] text-white/80 mt-16">
      {/* بخش بالایی */}
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* ستون ۱: درباره مطب */}
          <div>
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <span className="text-2xl">👩‍⚕️</span>
              زهره بصارت
            </h3>
            <p className="text-sm leading-relaxed mb-4 text-white/70">
              کارشناس مامایی با بیش از {clinicInfo.experience} سال تجربه در زمینه بهداشت زنان و مامایی.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Heart size={16} className="text-[var(--color-primary)] fill-[var(--color-primary)]" />
              <span>مراقبت گرم و حرفه‌ای</span>
            </div>
          </div>

          {/* ستون ۲: لینک‌های سریع */}
          <div>
            <h4 className="font-bold text-white mb-5">لینک‌های سریع</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">
                  صفحه اصلی
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[var(--color-primary)] transition-colors">
                  خدمات
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[var(--color-primary)] transition-colors">
                  درباره من
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[var(--color-primary)] transition-colors">
                  سوالات متداول
                </Link>
              </li>
              <li>
                <Link href="/appointment" className="hover:text-[var(--color-primary)] transition-colors">
                  رزرو نوبت
                </Link>
              </li>
            </ul>
          </div>

          {/* ستون ۳: اطلاعات تماس */}
          <div>
            <h4 className="font-bold text-white mb-5">اطلاعات تماس</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[var(--color-primary)] mt-1 flex-shrink-0" />
                <span className="text-white/70 leading-relaxed">{clinicInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[var(--color-primary)] flex-shrink-0" />
                <a href={`tel:${clinicInfo.phone}`} className="text-white/70 hover:text-[var(--color-primary)] transition-colors">
                  {clinicInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-[var(--color-primary)] flex-shrink-0" />
                <span className="text-white/70">{clinicInfo.hours}</span>
              </li>
            </ul>
          </div>

          {/* ستون ۴: شبکه‌های اجتماعی */}
          <div>
            <h4 className="font-bold text-white mb-5">ارتباط با ما</h4>
            <p className="text-sm text-white/70 mb-4 leading-relaxed">
              برای دریافت اطلاعات بیشتر و رزرو نوبت، با ما در ارتباط باشید.
            </p>
            
            {/* شبکه‌های اجتماعی */}
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors">
                <Mail size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors">
                <Share2 size={18} />
              </a>
            </div>

            {/* نشان اعتماد */}
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-xs text-white/50">شماره نظام پزشکی</div>
              <div className="text-xl font-bold text-white">{clinicInfo.license}</div>
            </div>
          </div>
        </div>
      </div>

      {/* بخش پایینی (کپی‌رایت) */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
          <p>
            © {currentYear} تمامی حقوق محفوظ است. مطب تخصصی مامایی زهره بصارت
          </p>
          <p className="flex items-center gap-1">
            ساخته شده با <Heart size={14} className="text-[var(--color-primary)] fill-[var(--color-primary)]" /> در خمینی‌شهر
          </p>
        </div>
      </div>
    </footer>
  );
}