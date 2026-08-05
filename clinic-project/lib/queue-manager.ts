// lib/queue-manager.ts
import { prisma } from './prisma';

type QueueItem = {
  id: string;
  message: string;
  sessionId: string;
  userId: number | null;
  history: any[];
  isAdmin: boolean;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  retries: number;
};

class QueueManager {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private requestTimestamps: number[] = [];
  private readonly MAX_REQUESTS_PER_MINUTE = 28; // ۲۸ برای احتیاط (به جای ۳۰)
  private readonly TIME_WINDOW = 60000; // ۶۰ ثانیه

  // اضافه کردن درخواست به صف
  enqueue(
    message: string,
    sessionId: string,
    userId: number | null,
    history: any[],
    isAdmin: boolean
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const item: QueueItem = {
        id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        message,
        sessionId,
        userId,
        history,
        isAdmin,
        resolve,
        reject,
        retries: 0,
      };
      this.queue.push(item);
      console.log(` درخواست ${item.id} به صف اضافه شد. اندازه صف: ${this.queue.length}`);
      this.processQueue();
    });
  }

  // پردازش صف
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    console.log(` شروع پردازش صف. تعداد درخواست‌ها: ${this.queue.length}`);

    while (this.queue.length > 0) {
      // بررسی محدودیت نرخ
      const canProcess = this.canProcessRequest();

      if (!canProcess) {
        const waitTime = this.getWaitTime();
        console.log(` رسیدیم به محدودیت نرخ. صبر می‌کنیم ${Math.ceil(waitTime / 1000)} ثانیه...`);
        await this.delay(waitTime);
        continue;
      }

      const item = this.queue.shift()!;
      try {
        console.log(` پردازش درخواست ${item.id}...`);
        const result = await this.processItem(item);
        item.resolve(result);
        console.log(`✅ درخواست ${item.id} با موفقیت پردازش شد`);
      } catch (error: any) {
        console.error(`❌ خطا در پردازش درخواست ${item.id}:`, error.message);
        // اگر خطای ۴۲۹ بود و تعداد تلاش‌ها کمتر از ۳ است، دوباره به صف اضافه کن
        if (error.status === 429 && item.retries < 3) {
          item.retries++;
          console.log(` تلاش مجدد ${item.retries} برای درخواست ${item.id}`);
          this.queue.unshift(item);
          await this.delay(2000 * item.retries);
        } else {
          item.reject(error);
        }
      }
    }

    this.isProcessing = false;
    console.log(`✅ پردازش صف به پایان رسید.`);
  }

  // بررسی امکان ارسال درخواست جدید
  private canProcessRequest(): boolean {
    const now = Date.now();
    // حذف تایم‌استمپ‌های قدیمی‌تر از ۶۰ ثانیه
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.TIME_WINDOW
    );
    return this.requestTimestamps.length < this.MAX_REQUESTS_PER_MINUTE;
  }

  // زمان انتظار تا آزاد شدن محدودیت
  private getWaitTime(): number {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.TIME_WINDOW
    );
    if (this.requestTimestamps.length === 0) return 0;
    // قدیمی‌ترین تایم‌استمپ + ۶۰ ثانیه - زمان فعلی
    const oldest = Math.min(...this.requestTimestamps);
    return Math.max(0, oldest + this.TIME_WINDOW - now + 100);
  }

  // پردازش یک آیتم (درخواست به Groq)
  private async processItem(item: QueueItem) {
    const { message, sessionId, userId, history, isAdmin } = item;

    // ثبت تایم‌استمپ برای محدودیت نرخ
    this.requestTimestamps.push(Date.now());

    // ============================================================
    // اینجا کد اصلی ارسال به Groq قرار می‌گیرد
    // ============================================================
    const { prisma } = await import('./prisma');

    // بررسی پاسخ ادمین
    const existingMessage = await prisma.chatMessage.findFirst({
      where: {
        userMsg: message,
        sessionId: sessionId || 'guest-session',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingMessage?.adminReply) {
      return { reply: existingMessage.adminReply };
    }

    // ارسال به Groq
    const { default: OpenAI } = await import('openai');
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const SYSTEM_PROMPT = `تو یک دستیار هوشمند برای مطب تخصصی مامایی خانم فرشته صادقی هستی...`; // پرامپت کامل

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      'متاسفانه نتوانستم پاسخ را پیدا کنم.';

    await prisma.chatMessage.create({
      data: {
        sessionId: sessionId || 'guest-session',
        userId: userId ? parseInt(userId as any) : null,
        userMsg: message,
        botMsg: reply,
        adminReply: null,
        isRead: false,
      },
    });

    return { reply };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================
// صادر کردن یک نمونه Singleton از QueueManager
// ============================================================
export const queueManager = new QueueManager();