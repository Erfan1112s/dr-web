// app/components/ui/floatingBookButten.tsx
'use client';

import { Calendar } from 'lucide-react';

export default function FloatingBookButton() {
  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToBooking}
      className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 hover:shadow-xl md:hidden group"
      aria-label="رزرو نوبت"
    >
      <Calendar size={24} className="group-hover:rotate-12 transition-transform" />
    </button>
  );
}