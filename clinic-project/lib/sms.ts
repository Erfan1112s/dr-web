// lib/sms.ts
import axios from 'axios';

const KAVENEGAR_API_KEY = process.env.KAVENEGAR_API_KEY;
const BASE_URL = 'https://api.kavenegar.com/v1';

// ============================================================
// ۱. نرمالایز کردن شماره موبایل (پشتیبانی از ۰۹۰، ۰۹۱، ...)
// ============================================================
function normalizePhone(phone: string): string {

    if (!phone) {
        throw new Error("شماره موبایل وارد نشده است.");
    }

    // تبدیل اعداد فارسی و عربی به انگلیسی
    const toEnglish = (value: string) =>
        value
            .replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
            .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

    let cleaned = toEnglish(phone);

    cleaned = cleaned
        .replace(/\s/g, "")
        .replace(/-/g, "")
        .replace(/\(/g, "")
        .replace(/\)/g, "");

    if (cleaned.startsWith("+98")) {
        cleaned = "0" + cleaned.substring(3);
    }

    if (cleaned.startsWith("0098")) {
        cleaned = "0" + cleaned.substring(4);
    }

    if (cleaned.startsWith("98")) {
        cleaned = "0" + cleaned.substring(2);
    }

    if (!/^09\d{9}$/.test(cleaned)) {
        throw new Error(`شماره موبایل نامعتبر است: ${phone}`);
    }

    return cleaned;
}

// ============================================================
// ۲. دریافت شماره فرستنده (Sender) از env
// ============================================================
function getSenderNumber(): string {
  // شماره خط اختصاصی را از env بخوان، یا از یک مقدار پیش‌فرض استفاده کن
  const sender = process.env.KAVENEGAR_SENDER;
  if (sender) {
    return sender;
  }
  // اگر تنظیم نشده، خطا نده و به کاوه‌نگار اجازه بده از خط پیش‌فرض استفاده کند
  console.warn('⚠️ شماره فرستنده (KAVENEGAR_SENDER) در env تنظیم نشده است. کاوه‌نگار از خط پیش‌فرض استفاده خواهد کرد.');
  return '';
}

// ============================================================
// ۳. ارسال پیامک تأیید نوبت به بیمار
// ============================================================
export async function sendAppointmentSMS(
  phone: string,
  name: string,
  day: string,
  time: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!KAVENEGAR_API_KEY) {
    console.error('❌ کلید API کاوه‌نگار تنظیم نشده است');
    return { success: false, error: 'کلید API تنظیم نشده' };
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(phone);
  } catch (error: any) {
    console.error('❌ خطا در نرمالایز شماره:', error.message);
    return { success: false, error: error.message };
  }

  const message = `سلام ${name} عزیز 

نوبت شما در مطب تخصصی مامایی فرشته صادقی با موفقیت ثبت شد.

 روز: ${day}
 ساعت: ${time}

آدرس: خمینی‌شهر، خیابان بوعلی، روبروی بانک مسکن
تلفن: ۰۳۱۳۲۶۷۱۰۵۵

🔹 لطفاً ۱۵ دقیقه زودتر حضور داشته باشید.
🔹 همراه داشتن کارت ملی و بیمه الزامی است.

با احترام،
مطب خانم فرشته صادقی
کارشناس مامایی`;

  try {
    // ساخت payload
const payload = new URLSearchParams();

payload.append("receptor", normalizedPhone);
payload.append("message", message);

const sender = getSenderNumber();

if(sender){
    payload.append("sender", sender);
}

    // این بخش دیگر لازم نیست، زیرا قبلاً شماره فرستنده به payload اضافه شده است

    const response = await axios.post(
      `${BASE_URL}/${KAVENEGAR_API_KEY}/sms/send.json`,
      payload,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    const result = response.data;

    if (result.return?.status === 200) {
      const messageId = result.entries?.[0]?.messageid;
      console.log(`✅ پیامک بیمار ارسال شد. ID: ${messageId} | گیرنده: ${normalizedPhone}`);
      return { success: true, messageId };
    } else {
      const errorMsg = result.return?.message || 'خطای ناشناخته';
      console.error(`❌ خطا در ارسال پیامک بیمار: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک بیمار:');

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 412) {
        return {
          success: false,
          error: 'شماره موبایل نامعتبر است. لطفاً شماره را با ۰ شروع کنید و ۱۱ رقم وارد نمایید.',
        };
      } else if (status === 403) {
        return { success: false, error: 'کلید API نامعتبر یا حساب محدود شده است.' };
      } else if (status === 429) {
        return { success: false, error: 'تعداد درخواست‌ها بیش از حد مجاز است. چند دقیقه بعد تلاش کنید.' };
      } else {
        return {
          success: false,
          error: data?.return?.message || `خطا با کد ${status}`,
        };
      }
    } else if (error.request) {
      return { success: false, error: 'عدم دریافت پاسخ از سرور کاوه‌نگار' };
    } else {
      return { success: false, error: error.message || 'خطای ناشناخته' };
    }
  }
}

// ============================================================
// ۴. ارسال پیامک به ادمین (با شماره فرستنده)
// ============================================================
export async function sendAdminNotification(
  name: string,
  phone: string,
  day: string,
  time: string
): Promise<{ success: boolean; error?: string }> {
  const adminPhone = process.env.ADMIN_PHONE || '09123456789';

  if (!KAVENEGAR_API_KEY) {
    console.error('❌ کلید API کاوه‌نگار تنظیم نشده است');
    return { success: false, error: 'کلید API تنظیم نشده' };
  }

  let normalizedAdminPhone: string;
  try {
    normalizedAdminPhone = normalizePhone(adminPhone);
  } catch (error: any) {
    console.error('❌ شماره ادمین نامعتبر است:', error.message);
    return { success: false, error: 'شماره ادمین نامعتبر است' };
  }

  const message = ` نوبت جدید در مطب فرشته صادقی ثبت شد!

نام بیمار: ${name}
 شماره موبایل: ${phone}
 روز نوبت: ${day}
ساعت نوبت: ${time}

🔹 برای مدیریت نوبت به پنل ادمین مراجعه کنید.
🔹 لینک پنل: http://localhost:3000/dashboard/admin`;

  try {
    const payload: any = {
      receptor: normalizedAdminPhone,
      message: message,
    };

    // شماره فرستنده را حتماً تنظیم کن (برای ادمین الزامی است)
    const sender = getSenderNumber();
    if (sender) {
      payload.sender = sender;
    } else {
      // اگر شماره فرستنده تنظیم نشده، از یک شماره پیش‌فرض استفاده کن
      // این شماره را از پنل کاوه‌نگار > بخش "خطوط من" پیدا کن
      payload.sender = '1000596446'; // شماره خط اختصاصی خود را اینجا بگذار
      console.warn('⚠️ از شماره فرستنده پیش‌فرض استفاده شد. برای تغییر، KAVENEGAR_SENDER را در env تنظیم کنید.');
    }

    const response = await axios.post(
      `${BASE_URL}/${KAVENEGAR_API_KEY}/sms/send.json`,
      payload,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    const result = response.data;
    if (result.return?.status === 200) {
      console.log(`✅ پیامک ادمین ارسال شد. گیرنده: ${normalizedAdminPhone}`);
      return { success: true };
    } else {
      console.error('❌ خطا در ارسال پیامک ادمین:', result.return?.message);
      return { success: false, error: result.return?.message || 'خطا در ارسال پیامک ادمین' };
    }
  } catch (error: any) {
    console.error('❌ خطا در ارسال پیامک ادمین:');

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 412) {
        return {
          success: false,
          error: 'شماره فرستنده (Sender) در کاوه‌نگار معتبر نیست. لطفاً شماره خط اختصاصی را در تنظیمات پنل کاوه‌نگار بررسی کنید.',
        };
      } else {
        return { success: false, error: data?.return?.message || `خطا با کد ${status}` };
      }
    }

    return { success: false, error: error.message || 'خطا در ارسال پیامک ادمین' };
  }
}