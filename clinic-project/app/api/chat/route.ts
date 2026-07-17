// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const faq: Record<string, string> = {
  'ساعت کاری': 'مطب روزهای یکشنبه و سه‌شنبه از ساعت ۴:۳۰ تا ۸:۳۰ شب پذیرش دارد.',
  'آدرس': 'خمینی‌شهر — خیابان بوعلی، روبروی بانک مسکن، جنب عینک چشم روشن',
  'تلفن': '۰۳۱۳۲۶۷۱۰۵۵',
  'ویزیت': 'ویزیت رایگان است.',
  'بیمه': 'نسخه و آزمایشات تحت پوشش بیمه هستند.',
  'خدمات': 'مراقبت بارداری، بیماری‌های زنان، IUD، پاپ اسمیر، مشاوره قبل و بعد زایمان',
  'نوبت': 'برای نوبت‌دهی لطفاً روی دکمه سبز رنگ در صفحه کلیک کنید یا با شماره تماس بگیرید.',
  'دکتر': 'فرشته صادقی، کارشناس مامایی با شماره نظام پزشکی ۳۲۳۲۴',
};

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId } = await req.json();
    const userMsg = message.trim().toLowerCase();

    // پیدا کردن پاسخ
    let reply = 'سوال شما در پایگاه داده یافت نشد. لطفاً با مطب تماس بگیرید یا سوال خود را دقیق‌تر بپرسید.';
    for (const [key, value] of Object.entries(faq)) {
      if (userMsg.includes(key)) {
        reply = value;
        break;
      }
    }

    // ذخیره پیام‌ها در دیتابیس
    const chatMessage = await prisma.chatMessage.create({
      data: {
        sessionId: sessionId || 'guest-session',
        userId: userId ? parseInt(userId) : null,
        userMsg: message,
        botMsg: reply,
        isRead: false,
      },
    });

    return NextResponse.json({
      reply,
      messageId: chatMessage.id,
    });
  } catch (error) {
    console.error('❌ Error in chat API:', error);
    return NextResponse.json({ error: 'خطای داخلی سرور' }, { status: 500 });
  }
}