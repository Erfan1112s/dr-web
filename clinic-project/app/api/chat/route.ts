// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// ============================================================
// ۱. راه‌اندازی کلاینت Mistral (OpenAI Compatible)
// ============================================================
const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1', // آدرس Mistral
});

// ============================================================
// ۲. پرامپت سیستم
// ============================================================
const SYSTEM_PROMPT = `تو یک دستیار هوشمند برای مطب تخصصی مامایی خانم فرشته صادقی هستی.
اطلاعات مطب:
- نام: فرشته صادقی
- تخصص: کارشناس مامایی
- شماره نظام پزشکی: ۳۲۳۲۴
- تلفن: ۰۳۱۳۲۶۷۱۰۵۵
- آدرس: خمینی‌شهر، خیابان بوعلی، روبروی بانک مسکن، جنب عینک چشم روشن
- ساعات کاری: یکشنبه و سه‌شنبه، ساعت ۴:۳۰ تا ۸:۳۰ شب
- ویزیت: رایگان
- بیمه: نسخه و آزمایشات تحت پوشش بیمه هستند
- خدمات: مراقبت بارداری، بیماری‌های زنان، IUD، پاپ اسمیر، مشاوره قبل و بعد زایمان
- نوبت‌دهی: ۱ تا ۲ روز جلوتر، نوبت اورژانسی دارد

تو باید با لحنی گرم، حرفه‌ای و زنانه پاسخ بدی.
اگر سوالی خارج از حیطه مامایی بود، با مهربانی بگو که در این زمینه تخصص ندارم.`;

// ============================================================
// ۳. GET: دریافت تاریخچه چت
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId الزامی است' },
        { status: 400 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        userMsg: true,
        botMsg: true,
        adminReply: true,
        createdAt: true,
      },
    });

    const filteredMessages = isAdmin
      ? messages.map((msg) => ({
          id: msg.id,
          userMsg: msg.userMsg,
          adminReply: msg.adminReply,
          createdAt: msg.createdAt,
        }))
      : messages;

    return NextResponse.json({ messages: filteredMessages });
  } catch (error) {
    console.error('❌ Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تاریخچه' },
      { status: 500 }
    );
  }
}

// ============================================================
// ۴. POST: ارسال پیام و دریافت پاسخ از Mistral
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, history, isAdmin } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'پیام را وارد کنید' },
        { status: 400 }
      );
    }

    // ادمین فقط می‌تواند پاسخ بنویسد (ربات پاسخ نمی‌دهد)
    if (isAdmin) {
      return NextResponse.json({
        reply: 'شما به عنوان ادمین وارد شده‌اید. لطفاً پاسخ خود را مستقیماً بنویسید.',
        isAdmin: true,
      });
    }

    // بررسی وجود پاسخ ادمین قبلی
    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        userMsg: message,
        sessionId: sessionId || 'guest-session',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingMessage?.adminReply) {
      return NextResponse.json({ reply: existingMessage.adminReply });
    }

    // ============================================================
    // ساخت پیام‌ها برای Mistral
    // ============================================================
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // مدل‌های رایگان Mistral:
    // - 'mistral-tiny' (سریع‌ترین و سبک‌ترین)
    // - 'mistral-small' (کیفیت بهتر، کمی کندتر)
    const model = 'mistral-small';

    try {
      const completion = await mistral.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const reply =
        completion.choices[0]?.message?.content ||
        'متاسفانه نتوانستم پاسخ را پیدا کنم. لطفاً دوباره تلاش کنید.';

      // ذخیره در دیتابیس
      await prisma.chatMessage.create({
        data: {
          sessionId: sessionId || 'guest-session',
          userId: userId ? parseInt(userId) : null,
          userMsg: message,
          botMsg: reply,
          adminReply: null,
          isRead: false,
        },
      });

      return NextResponse.json({ reply });
    } catch (mistralError: any) {
      console.error('❌ Mistral API error:', mistralError);

      // مدیریت خطاهای خاص Mistral
      if (mistralError.status === 401) {
        return NextResponse.json(
          { error: 'کلید API نامعتبر است. لطفاً از پنل Mistral کلید جدید بگیرید.' },
          { status: 401 }
        );
      }

      if (mistralError.status === 403) {
        return NextResponse.json(
          { error: 'دسترسی به Mistral ممنوع است. لطفاً کلید API را بررسی کنید یا از IP دیگری استفاده کنید.' },
          { status: 403 }
        );
      }

      if (mistralError.status === 429) {
        return NextResponse.json(
          { error: 'تعداد درخواست‌ها بیش از حد مجاز است. چند لحظه بعد تلاش کنید.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'خطا در دریافت پاسخ از هوش مصنوعی. لطفاً دوباره تلاش کنید.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ General error:', error);
    return NextResponse.json(
      { error: 'خطا در پردازش درخواست' },
      { status: 500 }
    );
  }
}