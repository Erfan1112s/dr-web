// lib/date-utils.ts
import { toJalaali, toGregorian } from 'jalaali-js';

// ============================================================
// تبدیل تاریخ میلادی به شمسی (برای نمایش)
// ============================================================
export function toJalaliDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    console.warn('⚠️ تاریخ نامعتبر:', date);
    return 'تاریخ نامعتبر';
  }
  const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
}

// ============================================================
// تبدیل تاریخ شمسی به میلادی (برای ذخیره در دیتابیس)
// ============================================================
export function toGregorianDate(jalaliStr: string): Date {
  console.log('🔍 دریافت تاریخ شمسی برای تبدیل:', jalaliStr);

  // حذف کاراکترهای غیرمجاز و جداسازی
  const cleaned = jalaliStr.replace(/[^0-9\/]/g, '');
  const parts = cleaned.split('/').map(Number);
  
  if (parts.length !== 3 || parts.some(isNaN)) {
    console.error('❌ فرمت تاریخ نامعتبر:', jalaliStr);
    throw new Error(`فرمت تاریخ نامعتبر: ${jalaliStr}`);
  }

  const [year, month, day] = parts;
  console.log(`📅 سال: ${year}, ماه: ${month}, روز: ${day}`);

  const g = toGregorian(year, month, day);
  const result = new Date(g.gy, g.gm - 1, g.gd);
  console.log('📅 تاریخ میلادی حاصل:', result);
  return result;
}

// ============================================================
// تبدیل تاریخ میلادی به شمسی با نام روز هفته
// ============================================================
export function toJalaliDateWithWeekday(date: Date): string {
  const weekdays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  const weekday = weekdays[date.getDay()];
  return `${weekday} ${toJalaliDate(date)}`;
}

// ============================================================
// تبدیل تاریخ میلادی به شمسی (برای پیامک)
// ============================================================
export function toJalaliDateForSMS(date: Date): string {
  return toJalaliDate(date);
}

// ============================================================
// دریافت تاریخ شمسی امروز
// ============================================================
export function getTodayJalali(): string {
  return toJalaliDate(new Date());
}

// ============================================================
// دریافت تاریخ شمسی برای روز هفته آینده (یکشنبه یا سه‌شنبه)
// ============================================================
export function getNextJalaliDateForDay(day: string): string {
  const now = new Date();
  const dayMap: Record<string, number> = {
    'یکشنبه': 1,
    'سه‌شنبه': 3,
  };
  const targetDay = dayMap[day];
  const currentDay = now.getDay(); // 0=شنبه
  
  let diff = targetDay - currentDay;
  if (diff <= 0) diff += 7;
  
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  
  // اگر امروز یکشنبه یا سه‌شنبه باشد و زمان فعلی بعد از ۸:۳۰ شب باشد، یک هفته بعد
  const hour = now.getHours();
  const minute = now.getMinutes();
  if (diff === 0 && (hour > 20 || (hour === 20 && minute >= 30))) {
    date.setDate(date.getDate() + 7);
  }
  
  const result = toJalaliDate(date);
  console.log(`📅 تاریخ شمسی برای ${day}: ${result}`);
  return result;
}

// ============================================================
// بررسی اینکه آیا تاریخ گذشته است یا نه
// ============================================================
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return target < today;
}

// ============================================================
// تبدیل تاریخ میلادی به رشته YYYY-MM-DD برای API
// ============================================================
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}