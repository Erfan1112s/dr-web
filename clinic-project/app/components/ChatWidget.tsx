// components/ChatWidget.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

type Message = {
  role: 'user' | 'bot' | 'admin';
  id?: string | number;
  content: string;
  timestamp: Date;
  botDisabled?: boolean;
};

export default function ChatWidget() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'سلام 🌸 من مامای هوشمند مطب خانم زهره بصارت هستم. چطور می‌توانم به شما کمک کنم؟ (ساعت کاری، خدمات، نوبت‌دهی و ...)',
      timestamp: new Date(),
      id: 'welcome-msg',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [botDisabled, setBotDisabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdsRef = useRef<Map<string | number, boolean>>(new Map());
  const isSendingRef = useRef(false);

  // ============================================================
  // ایجاد یا بازیابی sessionId
  // ============================================================
  const getSessionId = () => {
    let storedId = localStorage.getItem('chatSessionId');
    if (!storedId) {
      storedId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('chatSessionId', storedId);
    }
    return storedId;
  };

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    messageIdsRef.current.set('welcome-msg', true);
  }, []);

  // ============================================================
  // اسکرول به انتهای پیام‌ها
  // ============================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================================
  // بارگذاری تاریخچه چت (با ترتیب صحیح)
  // ============================================================
  const loadHistory = useCallback(
    async (currentSessionId = sessionId) => {
      if (!currentSessionId || isSendingRef.current) return;

      try {
        const res = await fetch(
          `/api/chat?sessionId=${encodeURIComponent(currentSessionId)}&isAdmin=${isAdmin}`,
          { cache: 'no-store' }
        );

        if (!res.ok) {
          console.error('❌ خطا در پاسخ API:', res.status);
          return;
        }

        const data = await res.json();
        const newMessages: Message[] = [];

        (data.messages || []).forEach((msg: any) => {
          const baseId = msg.id;
          if (!baseId) return;

          const baseTime = new Date(msg.createdAt).getTime();

          // 1. پیام کاربر (زمان اصلی)
          const userKey = `user-${baseId}`;
          if (msg.userMsg && !messageIdsRef.current.has(userKey)) {
            messageIdsRef.current.set(userKey, true);
            newMessages.push({
              id: userKey,
              role: 'user',
              content: msg.userMsg,
              timestamp: new Date(baseTime),
            });
          }

          // 2. پاسخ ربات (۱ میلی‌ثانیه بعد)
          const botKey = `bot-${baseId}`;
          if (msg.botMsg && !messageIdsRef.current.has(botKey)) {
            messageIdsRef.current.set(botKey, true);
            newMessages.push({
              id: botKey,
              role: 'bot',
              content: msg.botMsg,
              timestamp: new Date(baseTime + 1),
              botDisabled: msg.botDisabled,
            });
          }

          // 3. پاسخ ادمین (۲ میلی‌ثانیه بعد)
          const adminKey = `admin-${baseId}`;
          if (msg.adminReply && !messageIdsRef.current.has(adminKey)) {
            messageIdsRef.current.set(adminKey, true);
            newMessages.push({
              id: adminKey,
              role: 'admin',
              content: msg.adminReply,
              timestamp: new Date(baseTime + 2),
              botDisabled: msg.botDisabled,
            });
          }
        });

        // مرتب‌سازی نهایی بر اساس زمان
        newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        if (newMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const filtered = newMessages.filter((m) => m.id && !existingIds.has(m.id));
            return [...prev, ...filtered];
          });
        }

        // وضعیت ربات
        const lastMsg = data.messages?.[data.messages.length - 1];
        if (lastMsg) {
          setBotDisabled(lastMsg.botDisabled === true);
        }
      } catch (error) {
        console.error('❌ Error loading chat history:', error);
      }
    },
    [sessionId, isAdmin]
  );

  // ============================================================
  // بارگذاری تاریخچه هنگام باز شدن چت و هر ۵ ثانیه
  // ============================================================
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    loadHistory(sessionId);
    const intervalId = window.setInterval(() => loadHistory(sessionId), 5000);

    return () => window.clearInterval(intervalId);
  }, [isOpen, loadHistory, sessionId]);

  // ============================================================
  // ارسال پیام جدید
  // ============================================================
  const sendMessage = async () => {
    if (!input.trim() || loading || isSendingRef.current) return;

    isSendingRef.current = true;
    setError(null);

    const userMsgId = `temp-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const currentSessionId = sessionId || getSessionId();
      setSessionId(currentSessionId);
      const userId = session?.user?.id || null;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: currentSessionId,
          userId,
          history: messages,
          isAdmin,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ خطا در API:', res.status, errorData);
        throw new Error(errorData.error || 'خطا در ارتباط با سرور');
      }

      const data = await res.json();

      if (isAdmin) {
        setLoading(false);
        setTimeout(() => loadHistory(currentSessionId), 300);
        return;
      }

      // کاربر عادی: دریافت پاسخ از ربات
      const botMsgId = `bot-${Date.now()}`;
      const botMsgContent = data.botDisabled
        ? 'پیام شما دریافت شد. کارشناس مطب در حال بررسی است و به زودی پاسخ می‌دهد.'
        : data.reply || 'پاسخی دریافت نشد.';

      const botMsg: Message = {
        id: botMsgId,
        role: 'bot',
        content: botMsgContent,
        timestamp: new Date(),
        botDisabled: data.botDisabled || false,
      };

      // جایگزینی پیام موقت کاربر با نسخه واقعی و اضافه کردن پاسخ ربات
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== userMsgId);
        const realUserMsg = {
          ...userMsg,
          id: `user-${Date.now()}`,
        };
        return [...filtered, realUserMsg, botMsg];
      });

      if (data.botDisabled) {
        setBotDisabled(true);
      }
    } catch (error: any) {
      console.error('❌ خطا در ارسال پیام:', error);
      setError(error.message || 'خطا در ارتباط با سرور');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsgId
            ? {
                ...m,
                content: '⚠️ خطا در ارسال پیام. لطفاً دوباره تلاش کنید.',
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      isSendingRef.current = false;
    }
  };

  // ============================================================
  // رندر ویجت چت
  // ============================================================
  return (
    <>
      {/* دکمه شناور */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-full p-4 shadow-xl transition-all duration-300 flex items-center justify-center w-14 h-14 md:w-14 md:h-14"
        aria-label="باز کردن چت"
      >
        <MessageCircle size={28} />
      </button>

      {/* پنجره چت */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 sm:inset-auto sm:bottom-24 sm:right-5 z-50 w-auto sm:w-96 h-[90vh] sm:h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* هدر */}
            <div className="bg-[var(--color-primary)] p-4 text-white flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="font-bold text-base">
                  {isAdmin ? 'پنل مدیریت چت' : 'مامای هوشمند مطب صادقی'}
                </h3>
                <p className="text-xs opacity-90">
                  {isAdmin ? 'پاسخ به پیام‌های کاربران' : 'پاسخگوی سوالات شما'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[var(--color-primary-dark)] rounded-full transition"
                aria-label="بستن چت"
              >
                <X size={24} />
              </button>
            </div>

            {/* نمایش خطا */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm mx-3 mt-3 rounded-xl flex-shrink-0">
                ⚠️ {error}
              </div>
            )}

            {/* وضعیت ربات */}
            {botDisabled && !isAdmin && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-2 text-xs text-center mx-3 mt-3 rounded-xl flex-shrink-0">
                ⏸️ کارشناس مطب در حال بررسی پیام‌های شماست. پاسخ شما به زودی ارسال می‌شود.
              </div>
            )}

            {/* پیام‌ها */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isAdminMsg = msg.role === 'admin';
                const isBot = msg.role === 'bot';

                let bgColor = 'bg-white text-gray-800 border border-gray-200 rounded-bl-none';
                let justify = 'justify-start';
                let label = '';

                if (isUser) {
                  bgColor = 'bg-[var(--color-primary)] text-white rounded-br-none';
                  justify = 'justify-end';
                } else if (isAdminMsg) {
                  bgColor = 'bg-green-100 text-gray-800 border border-green-200 rounded-bl-none';
                  label = 'پاسخ ادمین: ';
                } else if (isBot) {
                  bgColor = 'bg-white text-gray-800 border border-gray-200 rounded-bl-none';
                }

                return (
                  <div key={idx} className={`flex ${justify}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${bgColor}`}>
                      {label && <div className="text-xs font-semibold text-green-700 mb-1">{label}</div>}
                      {msg.content}
                      <div className="text-xs mt-1 opacity-70 text-left">
                        {new Intl.DateTimeFormat('fa-IR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && !isAdmin && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
                    <span className="text-sm text-gray-500">در حال تایپ...</span>
                  </div>
                </div>
              )}
              {isAdmin && (
                <div className="text-xs text-gray-400 text-center p-2 bg-gray-100 rounded-xl mt-2">
                  💡 شما به عنوان ادمین وارد شده‌اید. با ارسال پاسخ، ربات برای این کاربر غیرفعال می‌شود.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ورودی */}
            <div className="border-t p-3 bg-white flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isAdmin ? 'پاسخ خود را بنویسید...' : 'پیام خود را بنویسید...'}
                className="flex-1 border border-gray-300 rounded-full px-4 py-3 text-base focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-[var(--color-primary)] text-white p-3 rounded-full disabled:opacity-50 hover:bg-[var(--color-primary-dark)] transition flex items-center justify-center min-w-[48px] min-h-[48px]"
                aria-label="ارسال پیام"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}