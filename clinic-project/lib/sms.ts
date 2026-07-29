// lib/sms.ts
import axios from 'axios';

// ============================================================
// متغیرهای محیطی (مستقیماً از process.env)
// ============================================================
const SMSIR_API_KEY = process.env.SMSIR_API_KEY;
const SMSIR_LINE_NUMBER = process.env.SMSIR_LINE_NUMBER;

// ============================================================
// نرمالایز شماره
// ============================================================
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('98')) cleaned = '0' + cleaned.slice(2);
  if (cleaned.startsWith('+98')) cleaned = '0' + cleaned.slice(3);
  if (cleaned.startsWith('0098')) cleaned = '0' + cleaned.slice(4);
  if (cleaned.length === 11 && cleaned.startsWith('0')) return cleaned;
  throw new Error(`شماره موبایل نامعتبر است: ${phone}`);
}

// ============================================================
// ارسال پیامک به بیمار
// ============================================================
export async function sendAppointmentSMS(
  phone: string,
  name: string,
  day: string,
  time: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // خواندن متغیرها در زمان اجرا
  const apiKey = process.env.SMSIR_API_KEY;
  const lineNumber = process.env.SMSIR_LINE_NUMBER;

  if (!apiKey) {
    console.error('❌ SMSIR_API_KEY در محیط تنظیم نشده است');
    return { success: false, error: 'کلید API تنظیم نشده' };
  }

  if (!lineNumber) {
    console.error('❌ SMSIR_LINE_NUMBER در محیط تنظیم نشده است');
    return { success: false, error: 'شماره خط تنظیم نشده' };
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(phone);
  } catch (error: any) {
    console.error('❌ خطا در نرمالایز شماره:', error.message);
    return { success: false, error: error.message };
  }

  const message = `سلام ${name} عزیز 🌸

نوبت شما در مطب تخصصی مامایی فرشته صادقی با موفقیت ثبت شد.

📅 روز: ${day}
🕐 ساعت: ${time}

📍 آدرس: خمینی‌شهر، خیابان بوعلی، روبروی بانک مسکن
📞 تلفن: ۰۳۱۳۲۶۷۱۰۵۵

با احترام،
مطب خانم فرشته صادقی`;

  try {
    console.log(`📤 ارسال پیامک به ${normalizedPhone}...`);

    const response = await axios.post(
      'https://api.sms.ir/v1/send/bulk',
      {
        lineNumber: lineNumber,
        messageText: message,
        mobiles: [normalizedPhone],
        sendDateTime: null,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const result = response.data;

    if (result.status === 1) {
      console.log(`✅ پیامک ارسال شد. گیرنده: ${normalizedPhone}`);
      return { success: true };
    } else {
      console.error(`❌ خطا: ${result.message}`);
      return { success: false, error: result.message || 'خطا در ارسال پیامک' };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// ============================================================
// ارسال پیامک به ادمین
// ============================================================
export async function sendAdminNotification(
  name: string,
  phone: string,
  day: string,
  time: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SMSIR_API_KEY;
  const lineNumber = process.env.SMSIR_LINE_NUMBER;
  const adminPhone = process.env.ADMIN_PHONE || '09123456789';

  if (!apiKey) {
    console.error('❌ کلید API SMS.ir تنظیم نشده است');
    return { success: false, error: 'کلید API تنظیم نشده' };
  }

  if (!lineNumber) {
    console.error('❌ شماره خط SMS.ir تنظیم نشده است');
    return { success: false, error: 'شماره خط تنظیم نشده' };
  }

  let normalizedAdminPhone: string;
  try {
    normalizedAdminPhone = normalizePhone(adminPhone);
  } catch (error: any) {
    console.error('❌ شماره ادمین نامعتبر است:', error.message);
    return { success: false, error: 'شماره ادمین نامعتبر است' };
  }

  const message = `📋 نوبت جدید در مطب فرشته صادقی ثبت شد!

👤 نام بیمار: ${name}
📱 شماره موبایل: ${phone}
📅 روز نوبت: ${day}
🕐 ساعت نوبت: ${time}

🔹 برای مدیریت نوبت به پنل ادمین مراجعه کنید.`;

  try {
    const response = await axios.post(
      'https://api.sms.ir/v1/send/bulk',
      {
        lineNumber: lineNumber,
        messageText: message,
        mobiles: [normalizedAdminPhone],
        sendDateTime: null,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const result = response.data;
    if (result.status === 1) {
      console.log(`✅ پیامک ادمین ارسال شد. گیرنده: ${normalizedAdminPhone}`);
      return { success: true };
    } else {
      console.error('❌ خطا در ارسال پیامک ادمین:', result.message);
      return { success: false, error: result.message || 'خطا در ارسال پیامک ادمین' };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک ادمین:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// ============================================================
// تابع تست
// ============================================================
export async function testSMS(phone: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SMSIR_API_KEY;
  const lineNumber = process.env.SMSIR_LINE_NUMBER;

  if (!apiKey) {
    return { success: false, error: 'کلید API تنظیم نشده' };
  }

  if (!lineNumber) {
    return { success: false, error: 'شماره خط تنظیم نشده' };
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(phone);
  } catch (error: any) {
    return { success: false, error: error.message };
  }

  try {
    const response = await axios.post(
      'https://api.sms.ir/v1/send/bulk',
      {
        lineNumber: lineNumber,
        messageText: '✅ این یک پیامک تست از مطب مامایی فرشته صادقی است.',
        mobiles: [normalizedPhone],
        sendDateTime: null,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data.status === 1) {
      console.log(`✅ پیامک تست به ${normalizedPhone} ارسال شد`);
      return { success: true };
    } else {
      return { success: false, error: response.data.message || 'خطا در ارسال پیامک تست' };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک تست:', error.response?.data || error.message);
    return { success: false, error: error.message || 'خطا در ارسال پیامک تست' };
  }
}