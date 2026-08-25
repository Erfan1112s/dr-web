// lib/sms.ts
import axios from 'axios';

// ============================================================
// متغیرهای محیطی
// ============================================================
const SMSIR_API_KEY = process.env.SMSIR_API_KEY;
const SMSIR_LINE_NUMBER = process.env.SMSIR_LINE_NUMBER;
const SMSIR_TEMPLATE_ID = process.env.SMSIR_TEMPLATE_ID;

// ============================================================
// نرمالایز شماره موبایل (تبدیل اعداد فارسی/عربی به انگلیسی)
// ============================================================
function normalizePhone(phone: string): string {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let cleaned = phone;

  persianNumbers.forEach((p, i) => {
    cleaned = cleaned.replace(new RegExp(p, 'g'), englishNumbers[i]);
  });
  arabicNumbers.forEach((a, i) => {
    cleaned = cleaned.replace(new RegExp(a, 'g'), englishNumbers[i]);
  });

  cleaned = cleaned.replace(/[\s\-\(\)\+]/g, '');

  if (cleaned.startsWith('98')) cleaned = '0' + cleaned.slice(2);
  if (cleaned.startsWith('+98')) cleaned = '0' + cleaned.slice(3);
  if (cleaned.startsWith('0098')) cleaned = '0' + cleaned.slice(4);

  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return cleaned;
  }

  throw new Error(`شماره موبایل نامعتبر است: ${phone}`);
}

// ============================================================
// ارسال پیامک با متد Verify (قالب‌های از پیش تعریف‌شده)
// ============================================================
export async function sendAppointmentSMS(
  phone: string,
  name: string,
  date: string,
  day: string,
  time: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = SMSIR_API_KEY;
  const lineNumber = SMSIR_LINE_NUMBER;
  const templateId = SMSIR_TEMPLATE_ID;

  console.log('📤 [SMS] شروع ارسال پیامک Verify به:', phone);
  console.log('  API Key:', apiKey ? '✅ وجود دارد' : '❌ وجود ندارد');
  console.log('  Line Number:', lineNumber ? '✅ وجود دارد' : '❌ وجود ندارد');
  console.log('  Template ID:', templateId ? '✅ وجود دارد' : '❌ وجود ندارد');

  if (!apiKey) {
    console.error('❌ SMSIR_API_KEY تنظیم نشده است');
    return { success: false, error: 'کلید API تنظیم نشده' };
  }

  if (!lineNumber) {
    console.error('❌ SMSIR_LINE_NUMBER تنظیم نشده است');
    return { success: false, error: 'شماره خط تنظیم نشده' };
  }

  if (!templateId) {
    console.error('❌ SMSIR_TEMPLATE_ID تنظیم نشده است');
    return { success: false, error: 'شناسه قالب تنظیم نشده است' };
  }

  const lineNum = Number(lineNumber);
  if (isNaN(lineNum)) {
    console.error('❌ شماره خط نامعتبر:', lineNumber);
    return { success: false, error: 'شماره خط پیامک نامعتبر است' };
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(phone);
    console.log('  شماره نرمالایز شده:', normalizedPhone);
  } catch (error: any) {
    console.error('❌ خطا در نرمالایز شماره:', error.message);
    return { success: false, error: error.message };
  }

  try {
    console.log('📤 ارسال درخواست به SMS.ir (Verify)...');

    const response = await axios.post(
      'https://api.sms.ir/v1/send/verify',
      {
        lineNumber: lineNum,
        mobile: normalizedPhone,
        templateId: Number(templateId),
        parameters: [
          { name: 'NAME', value: name },
          { name: 'DATE', value: date },
          { name: 'DAY', value: day },
          { name: 'TIME', value: time },
        ],
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
      const messageId = response.data?.data?.messageId || 'unknown';
      console.log(`✅ پیامک با موفقیت ارسال شد. ID: ${messageId}`);
      return { success: true, messageId: String(messageId) };
    } else {
      const errorMsg = response.data?.message || 'خطای ناشناخته';
      console.error(`❌ خطا از سمت SMS.ir: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
      return {
        success: false,
        error: error.response.data?.message || `خطا با کد ${error.response.status}`,
      };
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
// ارسال پیامک به ادمین (با متد Bulk - بدون تغییر)
// ============================================================
export async function sendAdminNotification(
  name: string,
  phone: string,
  day: string,
  time: string
): Promise<{ success: boolean; error?: string }> {
  const adminPhone = process.env.ADMIN_PHONE || '09123456789';
  const apiKey = SMSIR_API_KEY;
  const lineNumber = SMSIR_LINE_NUMBER;

  if (!apiKey || !lineNumber) {
    console.log('⚠️ تنظیمات SMS.ir کامل نیست');
    return { success: false, error: 'تنظیمات پیامک کامل نیست' };
  }

  const lineNum = Number(lineNumber);
  if (isNaN(lineNum)) {
    return { success: false, error: 'شماره خط نامعتبر است' };
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(adminPhone);
  } catch (error: any) {
    console.error('❌ شماره ادمین نامعتبر:', error.message);
    return { success: false, error: 'شماره ادمین نامعتبر است' };
  }

  const message = `نوبت جدید در مطب فرشته صادقی ثبت شد!
نام: ${name} | موبایل: ${phone}
روز: ${day} | ساعت: ${time}
برای مدیریت به پنل ادمین مراجعه کنید.`;

  try {
    const response = await axios.post(
      'https://api.sms.ir/v1/send/bulk',
      {
        lineNumber: lineNum,
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

// ============================================================
// تابع تست (برای عیب‌یابی)
// ============================================================
export async function testSMS(phone: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = SMSIR_API_KEY;
  const lineNumber = SMSIR_LINE_NUMBER;
  const templateId = SMSIR_TEMPLATE_ID;

  if (!apiKey) {
    return { success: false, error: 'کلید API تنظیم نشده' };
  }
  if (!lineNumber) {
    return { success: false, error: 'شماره خط تنظیم نشده' };
  }
  if (!templateId) {
    return { success: false, error: 'شناسه قالب تنظیم نشده است' };
  }

  const lineNum = Number(lineNumber);
  if (isNaN(lineNum)) {
    return { success: false, error: 'شماره خط نامعتبر است' };
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(phone);
  } catch (error: any) {
    return { success: false, error: error.message };
  }

  try {
    const response = await axios.post(
      'https://api.sms.ir/v1/send/verify',
      {
        lineNumber: lineNum,
        mobile: normalizedPhone,
        templateId: Number(templateId),
        parameters: [
          { name: 'NAME', value: 'کاربر تست' },
          { name: 'DATE', value: '۱۴۰۳/۰۵/۲۵' },
          { name: 'DAY', value: 'یکشنبه' },
          { name: 'TIME', value: '۱۷:۰۰' },
        ],
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
      console.log(`✅ پیامک تست به ${normalizedPhone} ارسال شد`);
      return { success: true };
    } else {
      return { success: false, error: response.data?.message || 'خطا در ارسال پیامک تست' };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک تست:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}