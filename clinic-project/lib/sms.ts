// lib/sms.ts
import axios from 'axios';

const KAVENEGAR_API_KEY = process.env.KAVENEGAR_API_KEY;
const BASE_URL = 'https://api.kavenegar.com/v1';

// ============================================================
// ۱. نرمالایز کردن شماره موبایل (رفع خطای ۴۱۲)
// ============================================================
function normalizePhone(phone: string): string {
  // حذف همه فاصله‌ها، خط تیره، پرانتز و کاراکترهای غیرعددی
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');

  // اگر با ۹۸ شروع شد، به ۰ تبدیل کن (۹۸۹۱۲۳۴۵۶۷۸۹ → ۰۹۱۲۳۴۵۶۷۸۹)
  if (cleaned.startsWith('98')) {
    cleaned = '0' + cleaned.slice(2);
  }

  // اگر با +۹۸ شروع شد، به ۰ تبدیل کن (+۹۸۹۱۲۳۴۵۶۷۸۹ → ۰۹۱۲۳۴۵۶۷۸۹)
  if (cleaned.startsWith('+98')) {
    cleaned = '0' + cleaned.slice(3);
  }

  // اگر با ۰۰۹۸ شروع شد، به ۰ تبدیل کن (۰۰۹۸۹۱۲۳۴۵۶۷۸۹ → ۰۹۱۲۳۴۵۶۷۸۹)
  if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.slice(4);
  }

  // اعتبارسنجی نهایی: باید دقیقاً ۱۱ رقم و با ۰ شروع شود
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return cleaned;
  }

  // اگر شماره معتبر نبود، خطا بده
  throw new Error(`شماره موبایل نامعتبر است: ${phone}`);
}

// ============================================================
// ۲. ارسال پیامک تأیید نوبت به بیمار
// ============================================================
export async function sendAppointmentSMS(
  phone: string,
  name: string,
  day: string,
  time: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // بررسی وجود کلید API
  if (!KAVENEGAR_API_KEY) {
    console.error('❌ کلید API کاوه‌نگار تنظیم نشده است');
    return { success: false, error: 'کلید API تنظیم نشده' };
  }

  // نرمالایز کردن شماره موبایل
  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(phone);
  } catch (error: any) {
    console.error('❌ خطا در نرمالایز شماره:', error.message);
    return { success: false, error: error.message };
  }

  // متن پیامک (با نام و اطلاعات دکتر فرشته صادقی)
  const message = `سلام ${name} عزیز 🌸

نوبت شما در مطب تخصصی مامایی فرشته صادقی با موفقیت ثبت شد.

📅 روز: ${day}
🕐 ساعت: ${time}

📍 آدرس: خمینی‌شهر، خیابان بوعلی، روبروی بانک مسکن
📞 تلفن: ۰۳۱۳۲۶۷۱۰۵۵

🔹 لطفاً ۱۵ دقیقه زودتر حضور داشته باشید.
🔹 همراه داشتن کارت ملی و بیمه الزامی است.

با احترام،
مطب خانم فرشته صادقی
کارشناس مامایی`;

  try {
    // ارسال درخواست به کاوه‌نگار
    const response = await axios.post(
      `${BASE_URL}/${KAVENEGAR_API_KEY}/sms/send.json`,
      {
        receptor: normalizedPhone,
        message: message,
        // sender: "1000596446" // در صورت نیاز، شماره خط اختصاصی را وارد کنید
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000, // ۱۰ ثانیه تایم‌اوت
      }
    );

    const result = response.data;

    // بررسی پاسخ کاوه‌نگار
    if (result.return?.status === 200) {
      const messageId = result.entries?.[0]?.messageid;
      console.log(`✅ پیامک با موفقیت ارسال شد. ID: ${messageId} | گیرنده: ${normalizedPhone}`);
      return { success: true, messageId };
    } else {
      const errorMsg = result.return?.message || 'خطای ناشناخته از سمت کاوه‌نگار';
      console.error(`❌ خطا در ارسال پیامک: ${errorMsg}`, result);
      return { success: false, error: errorMsg };
    }
  } catch (error: any) {
    // مدیریت خطاهای شبکه و پاسخ‌های غیرموفق
    console.error('❌ خطا در ارسال پیامک:');

    if (error.response) {
      // سرور کاوه‌نگار پاسخ داده اما با خطا
      const status = error.response.status;
      const data = error.response.data;

      console.error(`  Status: ${status}`);
      console.error(`  Data:`, data);

      if (status === 412) {
        return {
          success: false,
          error: 'شماره موبایل نامعتبر است. لطفاً شماره را با ۰ شروع کنید و ۱۱ رقم وارد نمایید.',
        };
      } else if (status === 403) {
        return { success: false, error: 'کلید API نامعتبر یا حساب کاربری محدود شده است.' };
      } else if (status === 429) {
        return { success: false, error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند دقیقه بعد تلاش کنید.' };
      } else if (status === 500) {
        return { success: false, error: 'خطای داخلی سرور کاوه‌نگار. لطفاً بعداً تلاش کنید.' };
      } else {
        return {
          success: false,
          error: data?.return?.message || `خطا با کد ${status} در ارسال پیامک`,
        };
      }
    } else if (error.request) {
      // درخواست ارسال شده ولی پاسخی دریافت نشده
      console.error('  No response received from Kavenegar');
      return { success: false, error: 'عدم دریافت پاسخ از سرور کاوه‌نگار. اتصال اینترنت خود را بررسی کنید.' };
    } else {
      // خطای دیگر
      console.error(`  Error: ${error.message}`);
      return { success: false, error: error.message || 'خطای ناشناخته در ارسال پیامک' };
    }
  }
}

// ============================================================
// ۳. ارسال پیامک به ادمین (اطلاع از نوبت جدید)
// ============================================================
export async function sendAdminNotification(
  name: string,
  phone: string,
  day: string,
  time: string
): Promise<{ success: boolean; error?: string }> {
  const adminPhone = process.env.ADMIN_PHONE || '09123456789';

  // نرمالایز شماره ادمین
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

🔹 برای مدیریت نوبت به پنل ادمین مراجعه کنید.
🔹 لینک پنل: http://localhost:3000/dashboard/admin`;

  try {
    const response = await axios.post(
      `${BASE_URL}/${KAVENEGAR_API_KEY}/sms/send.json`,
      {
        receptor: normalizedAdminPhone,
        message: message,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    const result = response.data;
    if (result.return?.status === 200) {
      console.log(`✅ پیامک ادمین با موفقیت ارسال شد. گیرنده: ${normalizedAdminPhone}`);
      return { success: true };
    } else {
      console.error('❌ خطا در ارسال پیامک ادمین:', result.return?.message);
      return { success: false, error: result.return?.message || 'خطا در ارسال پیامک ادمین' };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک ادمین:', error.response?.data || error.message);
    return { success: false, error: error.message || 'خطا در ارسال پیامک ادمین' };
  }
}

// ============================================================
// ۴. تابع تست (برای عیب‌یابی)
// ============================================================
export async function testSMS(phone: string): Promise<{ success: boolean; error?: string }> {
  if (!KAVENEGAR_API_KEY) {
    return { success: false, error: 'کلید API تنظیم نشده' };
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(phone);
  } catch (error: any) {
    return { success: false, error: error.message };
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/${KAVENEGAR_API_KEY}/sms/send.json`,
      {
        receptor: normalizedPhone,
        message: '✅ این یک پیامک تست از مطب مامایی فرشته صادقی است. اگر این پیام را دریافت کردید، سیستم ارسال پیامک به درستی کار می‌کند.',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    if (response.data?.return?.status === 200) {
      console.log(`✅ پیامک تست به ${normalizedPhone} ارسال شد`);
      return { success: true };
    } else {
      return { success: false, error: response.data?.return?.message || 'خطا در ارسال پیامک تست' };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک تست:', error.response?.data || error.message);
    return { success: false, error: error.message || 'خطا در ارسال پیامک تست' };
  }
}