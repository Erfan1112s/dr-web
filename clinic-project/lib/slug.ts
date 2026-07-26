// lib/slug.ts

/**
 * تبدیل متن به اسلاگ (آدرس یکتا)
 * - حذف کاراکترهای خاص
 * - جایگزینی فاصله با خط تیره
 * - تبدیل به حروف کوچک
 */
export function slugify(text: string): string {
  if (!text) return '';

  return text
    .trim()
    .toLowerCase()
    // جایگزینی کاراکترهای فارسی با معادل انگلیسی
    .replace(/[آا]/g, 'a')
    .replace(/[ب]/g, 'b')
    .replace(/[پ]/g, 'p')
    .replace(/[ت]/g, 't')
    .replace(/[ث]/g, 's')
    .replace(/[ج]/g, 'j')
    .replace(/[چ]/g, 'ch')
    .replace(/[ح]/g, 'h')
    .replace(/[خ]/g, 'kh')
    .replace(/[د]/g, 'd')
    .replace(/[ذ]/g, 'z')
    .replace(/[ر]/g, 'r')
    .replace(/[ز]/g, 'z')
    .replace(/[ژ]/g, 'zh')
    .replace(/[س]/g, 's')
    .replace(/[ش]/g, 'sh')
    .replace(/[ص]/g, 's')
    .replace(/[ض]/g, 'z')
    .replace(/[ط]/g, 't')
    .replace(/[ظ]/g, 'z')
    .replace(/[ع]/g, 'a')
    .replace(/[غ]/g, 'gh')
    .replace(/[ف]/g, 'f')
    .replace(/[ق]/g, 'gh')
    .replace(/[ک]/g, 'k')
    .replace(/[گ]/g, 'g')
    .replace(/[ل]/g, 'l')
    .replace(/[م]/g, 'm')
    .replace(/[ن]/g, 'n')
    .replace(/[و]/g, 'v')
    .replace(/[ه]/g, 'h')
    .replace(/[ی]/g, 'y')
    // حذف کاراکترهای غیرمجاز (فقط حروف انگلیسی، اعداد و خط تیره)
    .replace(/[^a-z0-9\-]/g, '')
    // جایگزینی چند خط تیره با یک خط تیره
    .replace(/\-+/g, '-')
    // حذف خط تیره از ابتدا و انتها
    .replace(/^\-+|\-+$/g, '');
}