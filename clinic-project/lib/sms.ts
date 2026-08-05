// lib/sms.ts
import axios from 'axios';

// ============================================================
// نرمالایز شماره موبایل (تبدیل اعداد فارسی/عربی به انگلیسی)
// ============================================================
function normalizePhone(phone: string): string {
  // تبدیل اعداد فارسی/عربی به انگلیسی
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let cleaned = phone;

  // جایگزینی اعداد فارسی
  persianNumbers.forEach((p, i) => {
    cleaned = cleaned.replace(new RegExp(p, 'g'), englishNumbers[i]);
  });

  // جایگزینی اعداد عربی
  arabicNumbers.forEach((a, i) => {
    cleaned = cleaned.replace(new RegExp(a, 'g'), englishNumbers[i]);
  });

  // حذف فاصله، خط تیره، پرانتز و +
  cleaned = cleaned.replace(/[\s\-\(\)\+]/g, '');

  // اگر با ۹۸ شروع شد، به ۰ تبدیل کن
  if (cleaned.startsWith('98')) {
    cleaned = '0' + cleaned.slice(2);
  }

  // اگر با +۹۸ شروع شد، به ۰ تبدیل کن
  if (cleaned.startsWith('+98')) {
    cleaned = '0' + cleaned.slice(3);
  }

  // اگر با ۰۰۹۸ شروع شد، به ۰ تبدیل کن
  if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.slice(4);
  }

  // اعتبارسنجی نهایی: باید ۱۱ رقم باشد و با ۰ شروع شود
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return cleaned;
  }

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
  const apiKey = process.env.SMSIR_API_KEY;
  const lineNumber = process.env.SMSIR_LINE_NUMBER;

  console.log(' [SMS] شروع ارسال پیامک به:', phone);
  console.log('  API Key:', apiKey ? '✅ وجود دارد' : '❌ وجود ندارد');
  console.log('  Line Number:', lineNumber ? '✅ وجود دارد' : '❌ وجود ندارد');

  if (!apiKey || !lineNumber) {
    console.error('❌ متغیرهای محیطی کامل نیستند');
    return { success: false, error: 'تنظیمات پیامک کامل نیست' };
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(phone);
    console.log('  شماره نرمالایز شده:', normalizedPhone);
  } catch (error: any) {
    console.error('❌ خطا در نرمالایز شماره:', error.message);
    return { success: false, error: error.message };
  }

  const message = `سلام ${name} عزیز 
نوبت شما در مطب مامایی فرشته صادقی ثبت شد.
 روز: ${day} |  ساعت: ${time}
 خمینی‌شهر، خیابان بوعلی، روبروی بانک مسکن
 ۰۳۱۳۲۶۷۱۰۵۵`;

  try {
    console.log(' ارسال درخواست به SMS.ir...');

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

    console.log('✅ پاسخ SMS.ir:', JSON.stringify(response.data, null, 2));

    if (response.data?.status === 1) {
      console.log('✅ پیامک با موفقیت ارسال شد');
      return { success: true };
    } else {
      const errorMsg = response.data?.message || 'خطای ناشناخته';
      console.error('❌ خطا از سمت SMS.ir:', errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
      return { success: false, error: error.response.data?.message || `خطا با کد ${error.response.status}` };
    } else if (error.request) {
      console.error('  No response received');
      return { success: false, error: 'عدم دریافت پاسخ از سرور' };
    } else {
      console.error('  Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// ============================================================
// ارسال پیامک به ادمین (اطلاع از نوبت جدید)
// ============================================================
export async function sendAdminNotification(
  name: string,
  phone: string,
  day: string,
  time: string
): Promise<{ success: boolean; error?: string }> {
  const adminPhone = process.env.ADMIN_PHONE || '09123456789';
  const apiKey = process.env.SMSIR_API_KEY;
  const lineNumber = process.env.SMSIR_LINE_NUMBER;

  if (!apiKey || !lineNumber) {
    console.log(' تنظیمات SMS.ir کامل نیست، پیامک ادمین ارسال نشد');
    return { success: false, error: 'تنظیمات پیامک کامل نیست' };
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(adminPhone);
  } catch (error: any) {
    console.error('❌ شماره ادمین نامعتبر:', error.message);
    return { success: false, error: 'شماره ادمین نامعتبر است' };
  }

  const message = ` نوبت جدید در مطب فرشته صادقی ثبت شد!
 نام بیمار: ${name}
 موبایل: ${phone}
 روز: ${day} |  ساعت: ${time}
 برای مدیریت به پنل ادمین مراجعه کنید.`;

  try {
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

    if (response.data?.status === 1) {
      console.log('✅ پیامک ادمین ارسال شد');
      return { success: true };
    } else {
      console.error('❌ خطا در ارسال پیامک ادمین:', response.data?.message);
      return { success: false, error: response.data?.message || 'خطا در ارسال' };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک ادمین:', error.message);
    return { success: false, error: error.message };
  }
}