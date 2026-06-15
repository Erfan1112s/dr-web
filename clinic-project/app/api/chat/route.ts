// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

// دانش پایه (می‌توانید بعداً به دیتابیس منتقل کنید)
const faq: Record<string, string> = {
  'ساعت کاری': 'مطب روزهای یکشنبه و سه‌شنبه از ساعت ۴:۳۰ تا ۸:۳۰ شب پذیرش دارد.',
  'آدرس': 'خمینی‌شهر — خیابان بوعلی، روبروی بانک مسکن، جنب عینک چشم روشن',
  'تلفن': '۰۳۱۳۲۶۷۱۰۵۵',
  'ویزیت': 'ویزیت رایگان است.',
  'بیمه': 'نسخه و آزمایشات تحت پوشش بیمه هستند.',
  'خدمات': 'مراقبت بارداری، بیماری‌های زنان، IUD، پاپ اسمیر، مشاوره قبل و بعد زایمان',
  'نوبت': 'برای نوبت‌دهی لطفاً روی دکمه سبز رنگ در صفحه کلیک کنید یا با شماره تماس بگیرید.',
  'دکتر': 'زهره بصارت، کارشناس مامایی با شماره نظام پزشکی ۳۲۳۲۴',
};

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const userMsg = message.trim().toLowerCase();

    let reply = 'سوال شما در پایگاه داده یافت نشد. لطفاً با مطب تماس بگیرید یا سوال خود را دقیق‌تر بپرسید.';
    for (const [key, value] of Object.entries(faq)) {
      if (userMsg.includes(key)) {
        reply = value;
        break;
      }
    }
    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطای داخلی سرور' }, { status: 500 });
  }
}