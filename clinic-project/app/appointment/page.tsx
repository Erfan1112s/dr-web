// app/appointment/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { toGregorianDate, getNextJalaliDateForDay, toDateString } from '@/lib/date-utils';

export default function AppointmentPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedDateJalali, setSelectedDateJalali] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const days = ['یکشنبه', 'سه‌شنبه'];
  const allTimes = ['۴:۳۰', '۵:۰۰', '۵:۳۰', '۶:۰۰', '۶:۳۰', '۷:۰۰', '۷:۳۰', '۸:۰۰', '۸:۳۰'];

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    const jalaliDate = getNextJalaliDateForDay(day);
    setSelectedDateJalali(jalaliDate);
    setStep(2);
  };

  // ============================================================
  // بخش fetchAvailableTimes (اصلاح‌شده با لاگ و مدیریت خطا)
  // ============================================================
  const fetchAvailableTimes = async () => {
    if (!selectedDay || !selectedDateJalali) return;
    setLoadingTimes(true);
    setError('');
    try {
      // تبدیل تاریخ شمسی به میلادی
      let gregorianDate: Date;
      let dateParam: string;
      try {
        gregorianDate = toGregorianDate(selectedDateJalali);
        dateParam = gregorianDate.toISOString().split('T')[0]; // YYYY-MM-DD
        console.log('📅 تاریخ شمسی:', selectedDateJalali);
        console.log('📅 تاریخ میلادی ارسال به API:', dateParam);
      } catch (err: any) {
        console.error('❌ خطا در تبدیل تاریخ:', err.message);
        setError('تاریخ انتخاب شده نامعتبر است');
        setLoadingTimes(false);
        return;
      }

      const res = await fetch(
        `/api/appointments?day=${encodeURIComponent(selectedDay)}&date=${dateParam}`
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ پاسخ خطا از API:', res.status, errorText);
        throw new Error(`خطا در دریافت ساعت‌ها: ${res.status}`);
      }

      const data = await res.json();
      console.log('✅ داده‌های دریافتی:', data);

      if (res.ok) {
        setAvailableTimes(Array.isArray(data.available) ? data.available : []);
      } else {
        setAvailableTimes([]);
        setError('خطا در دریافت ساعت‌های آزاد');
      }
    } catch (error: any) {
      console.error('❌ خطا در fetchAvailableTimes:', error.message);
      setAvailableTimes([]);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoadingTimes(false);
    }
  };

  useEffect(() => {
    if (selectedDay && selectedDateJalali) {
      fetchAvailableTimes();
    }
  }, [selectedDay, selectedDateJalali]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const userId = session?.user?.id || null;
      
      // تبدیل تاریخ شمسی به میلادی برای ذخیره
      let gregorianDate: Date;
      let dateParam: string;
      try {
        gregorianDate = toGregorianDate(selectedDateJalali);
        dateParam = gregorianDate.toISOString().split('T')[0]; // YYYY-MM-DD
        console.log('📅 تاریخ شمسی:', selectedDateJalali);
        console.log('📅 تاریخ میلادی ارسال به API:', dateParam);
      } catch (err: any) {
        setError('تاریخ انتخاب شده نامعتبر است');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: selectedDay,
          date: dateParam, // تاریخ میلادی برای ذخیره
          jalaliDate: selectedDateJalali, // تاریخ شمسی برای نمایش و پیامک
          time: selectedTime,
          name: formData.name,
          phone: formData.phone,
          description: formData.description,
          userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setStep(4);
      } else {
        setError(data.error || 'خطا در ثبت نوبت');
      }
    } catch (error) {
      console.error('❌ خطا در ثبت نوبت:', error);
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // رندر (همان کد قبلی)
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-primary-bg)] to-white py-16">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">رزرو نوبت آنلاین</h1>
          <p className="text-[var(--color-text-light)] text-lg">لطفاً اطلاعات زیر را تکمیل کنید</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6">{error}</div>
          )}

          {step === 1 && (
            <div className="animate-fadeInUp">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-[var(--color-primary)]" />
                روز مورد نظر را انتخاب کنید
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {days.map((day) => {
                  const jalaliDate = getNextJalaliDateForDay(day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleDaySelect(day)}
                      className="p-6 border-2 border-gray-200 rounded-2xl hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] transition-all text-lg font-medium text-center"
                    >
                      <div>{day}</div>
                      <div className="text-sm text-gray-400 mt-1">{jalaliDate}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-[var(--color-text-light)] mt-6 text-center">
                ⚠️ نوبت‌دهی فقط ۱ تا ۲ روز جلوتر انجام می‌شود
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeInUp">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Clock className="text-[var(--color-primary)]" />
                  ساعت مورد نظر را انتخاب کنید
                </h2>
                <button onClick={() => setStep(1)} className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)]">
                  ← بازگشت
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl mb-6 text-center">
                <span className="font-semibold">{selectedDay}</span>
                <span className="mx-2">•</span>
                <span className="font-semibold">{selectedDateJalali}</span>
              </div>

              {loadingTimes ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {allTimes.map((time) => {
                    const isAvailable = availableTimes.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && handleTimeSelect(time)}
                        disabled={!isAvailable}
                        className={`p-4 border-2 rounded-2xl transition-all text-center ${
                          isAvailable
                            ? 'border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg)]'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="text-lg font-medium">{time}</div>
                        <div className="text-xs text-[var(--color-text-light)]">
                          {isAvailable ? '✅ آزاد' : '❌ پر'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-sm text-[var(--color-text-light)] mt-6 text-center">
                🕒 ساعت کاری: ۴:۳۰ تا ۸:۳۰ شب
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadeInUp">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <User className="text-[var(--color-primary)]" />
                  اطلاعات خود را وارد کنید
                </h2>
                <button onClick={() => setStep(2)} className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)]">
                  ← بازگشت
                </button>
              </div>

              <div className="bg-[var(--color-primary-bg)] p-4 rounded-2xl mb-6 flex justify-between text-sm">
                <span>روز: <strong>{selectedDay}</strong></span>
                <span>تاریخ: <strong>{selectedDateJalali}</strong></span>
                <span>ساعت: <strong>{selectedTime}</strong></span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pr-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none"
                    placeholder="مثال: زهرا محمدی"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">شماره موبایل *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pr-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none"
                    placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">توضیحات (اختیاری)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none resize-none"
                    placeholder="نیاز خاصی دارید؟"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:shadow-xl text-white py-4 rounded-2xl text-lg font-medium transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      در حال ثبت...
                    </span>
                  ) : (
                    'ثبت نوبت و دریافت پیامک'
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 4 && isSuccess && (
            <div className="text-center py-8 animate-fadeInUp">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-500" size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-3">نوبت شما با موفقیت ثبت شد ✅</h2>
              <div className="bg-[var(--color-primary-bg)] p-4 rounded-2xl mb-6 text-right">
                <p><strong>روز:</strong> {selectedDay}</p>
                <p><strong>تاریخ:</strong> {selectedDateJalali}</p>
                <p><strong>ساعت:</strong> {selectedTime}</p>
                <p><strong>نام:</strong> {formData.name}</p>
              </div>
              <p className="text-[var(--color-text-light)] mb-4">پیامک تأیید برای شما ارسال شد.</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full hover:shadow-lg transition"
              >
                بازگشت به صفحه اصلی
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}