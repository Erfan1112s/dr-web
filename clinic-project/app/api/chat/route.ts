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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'شناسه گفتگو الزامی است' }, { status: 400 });
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

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('❌ Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پیام‌های چت' },
      { status: 500 }
    );
  }
}



export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'پیام را وارد کنید' }, { status: 400 });
    }

 const normalizedSessionId = sessionId || 'guest-session';
    let reply = 'متاسفانه مشکلی پیش آمده. لطفاً دوباره تلاش کنید یا با مطب تماس بگیرید.';

        try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(history || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ]
            const model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

        const completion = await openrouter.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }

      reply = completion.choices[0]?.message?.content ||
        'متاسفانه نتوانستم پاسخ را پیدا کنم. لطفاً دوباره تلاش کنید.';
    } catch (aiError) {
      console.error('❌ Error getting AI chat reply:', aiError);
    }

    const savedMessage = await prisma.chatMessage.create({

      data: {
        sessionId: normalizedSessionId',
        userId: userId ? parseInt(userId) : null,
        userMsg: message,
        botMsg: reply,
        adminReply: null,
        isRead: false,
      },
    });

    return NextResponse.json({
      id: savedMessage.id,
      reply,
      sessionId: normalizedSessionId,
    });
  } catch (error) {
    console.error('❌ Error in chat API:', error);
    return NextResponse.json(
      { error: 'خطا در ارتباط با سرور هوش مصنوعی' },
      { status: 500 }
    );
  }
}
