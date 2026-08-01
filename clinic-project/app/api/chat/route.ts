// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

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

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'پیام را وارد کنید' }, { status: 400 });
    }

    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        userMsg: message,
        sessionId: sessionId || 'guest-session',
      },
      orderBy: { createdAt: 'desc' },
    });

    // اگر پاسخ ادمین وجود داشت، آن را برگردان (بدون نیاز به AI)
    if (existingMessage?.adminReply) {
      return NextResponse.json({ reply: existingMessage.adminReply });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

    const completion = await openrouter.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content ||
      'متاسفانه نتوانستم پاسخ را پیدا کنم. لطفاً دوباره تلاش کنید.';

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
  } catch (error) {
    console.error('❌ Error in chat API:', error);
    return NextResponse.json(
      { error: 'خطا در ارتباط با سرور هوش مصنوعی' },
      { status: 500 }
    );
  }
}