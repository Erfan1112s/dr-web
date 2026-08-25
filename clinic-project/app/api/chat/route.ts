// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// ============================================================
// راه‌اندازی کلاینت Mistral (یا هر سرویس دیگر)
// ============================================================
const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1',
});

// ============================================================
// پرامپت سیستم
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
// GET: دریافت تاریخچه چت
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
        updatedAt: true,
      },
    });

    
    const messagesWithBotStatus = messages.map((msg) => ({
      ...msg,
      botDisabled: false,
    }));

    const filteredMessages = isAdmin
      ? messagesWithBotStatus.map((msg) => ({
          id: msg.id,
          userMsg: msg.userMsg,
          adminReply: msg.adminReply,
          botDisabled: msg.botDisabled,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        }))
      : messagesWithBotStatus;

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
// POST: ارسال پیام و دریافت پاسخ
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

    // اگر کاربر ادمین است، ربات پاسخ نمی‌دهد
    if (isAdmin) {
      return NextResponse.json({
        reply: 'شما به عنوان ادمین وارد شده‌اید. لطفاً پاسخ خود را مستقیماً بنویسید.',
        isAdmin: true,
      });
    }

    const currentSessionId = sessionId || 'guest-session';

    // ============================================================
    // ۱. بررسی وجود پاسخ ادمین قبلی برای این پیام
    // ============================================================
    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        userMsg: message,
        sessionId: currentSessionId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingMessage?.adminReply) {
      return NextResponse.json({ reply: existingMessage.adminReply });
    }

    // ============================================================
    // ۲. بررسی اینکه ربات برای این session غیرفعال شده است یا نه
    // ============================================================
    const lastMessage = await prisma.chatMessage.findFirst({
      where: { sessionId: currentSessionId },
      orderBy: { createdAt: 'desc' },
    });

    if (lastMessage?.botDisabled) {
      // ذخیره پیام کاربر اما بدون پاسخ ربات
      await prisma.chatMessage.create({
        data: {
          sessionId: currentSessionId,
          userId: userId ? parseInt(userId) : null,
          userMsg: message,
          botMsg: 'پیام شما دریافت شد. کارشناس مطب در حال بررسی است و به زودی پاسخ می‌دهد.',
          adminReply: null,
          botDisabled: true,
          isRead: false,
        },
      });

      return NextResponse.json({
        reply: 'پیام شما دریافت شد. کارشناس مطب در حال بررسی است و به زودی پاسخ می‌دهد.',
        botDisabled: true,
      });
    }

    // ============================================================
    // ۳. بررسی وجود پاسخ ادمین در تاریخچه (اگر قبلاً ادمین پاسخ داده بود)
    // ============================================================
    const hasAdminReply = await prisma.chatMessage.findFirst({
      where: {
        sessionId: currentSessionId,
        adminReply: { not: null },
      },
    });

    if (hasAdminReply) {
      // اگر قبلاً ادمین پاسخ داده، ربات را غیرفعال کن
      await prisma.chatMessage.updateMany({
        where: { sessionId: currentSessionId },
        data: { botDisabled: true },
      });

      await prisma.chatMessage.create({
        data: {
          sessionId: currentSessionId,
          userId: userId ? parseInt(userId) : null,
          userMsg: message,
          botMsg: 'پیام شما دریافت شد. کارشناس مطب در حال بررسی است و به زودی پاسخ می‌دهد.',
          adminReply: null,
          botDisabled: true,
          isRead: false,
        },
      });

      return NextResponse.json({
        reply: 'پیام شما دریافت شد. کارشناس مطب در حال بررسی است و به زودی پاسخ می‌دهد.',
        botDisabled: true,
      });
    }

    // ============================================================
    // ۴. دریافت پاسخ از هوش مصنوعی
    // ============================================================
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

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
          sessionId: currentSessionId,
          userId: userId ? parseInt(userId) : null,
          userMsg: message,
          botMsg: reply,
          adminReply: null,
          botDisabled: false,
          isRead: false,
        },
      });

      return NextResponse.json({ reply });
    } catch (aiError: any) {
      console.error('❌ AI API error:', aiError);

      // اگر هوش مصنوعی خطا داد، یک پیام پیش‌فرض برگردان
      const fallbackReply = 'متاسفانه در حال حاضر قادر به پاسخگویی نیستم. لطفاً بعداً تلاش کنید یا با مطب تماس بگیرید.';

      await prisma.chatMessage.create({
        data: {
          sessionId: currentSessionId,
          userId: userId ? parseInt(userId) : null,
          userMsg: message,
          botMsg: fallbackReply,
          adminReply: null,
          botDisabled: false,
          isRead: false,
        },
      });

      return NextResponse.json({ reply: fallbackReply });
    }
  } catch (error) {
    console.error('❌ General error in chat API:', error);
    return NextResponse.json(
      { error: 'خطا در پردازش درخواست' },
      { status: 500 }
    );
  }
}