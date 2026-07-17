// app/dashboard/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Phone, LogOut, XCircle, CheckCircle } from 'lucide-react';

type Appointment = {
  id: number;
  patientName: string;
  patientPhone: string;
  day: string;
  time: string;
  status: string;
  description?: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user) {
      void fetchAppointments();
    }
  }, [router, session?.user, status]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/appointments?userId=${session?.user?.id}`);
      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: number) => {
    if (!window.confirm('آیا از لغو این نوبت اطمینان دارید؟')) return;
    setCancelling(id);
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'cancelled' }),
      });
      if (res.ok) {
        setAppointments((prev) => prev.map((appointment) => (appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment)));
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <User className="text-[var(--color-primary)]" />
                پنل کاربری
              </h1>
              <p className="text-[var(--color-text-light)] text-sm">{session?.user?.name} عزیز خوش آمدید</p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 transition px-4 py-2 bg-red-50 rounded-full"
            >
              <LogOut size={18} />
              خروج
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-[var(--color-primary)]">{appointments.length}</div>
            <div className="text-sm text-[var(--color-text-light)]">کل نوبت‌ها</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-green-500">
              {appointments.filter((appointment) => appointment.status === 'confirmed').length}
            </div>
            <div className="text-sm text-[var(--color-text-light)]">نوبت‌های تأییدشده</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="text-[var(--color-primary)]" />
            نوبت‌های من
          </h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-light)]">
              <div className="text-6xl mb-4">📅</div>
              <p>شما هنوز هیچ نوبتی ثبت نکرده‌اید</p>
              <a href="/appointment" className="text-[var(--color-primary)] hover:underline mt-2 inline-block">
                ثبت نوبت جدید
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`p-5 rounded-2xl border flex justify-between items-center transition ${
                    appointment.status === 'cancelled'
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : appointment.status === 'confirmed'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-lg">{appointment.day}</span>
                      <span className="text-[var(--color-text-light)]">•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} className="text-gray-500" />
                        {appointment.time}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : appointment.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {appointment.status === 'confirmed'
                          ? 'تأیید شده'
                          : appointment.status === 'cancelled'
                          ? 'لغو شده'
                          : 'در انتظار تأیید'}
                      </span>
                    </div>
                    {appointment.description && (
                      <p className="text-sm text-[var(--color-text-light)] mt-1">{appointment.description}</p>
                    )}
                    <div className="text-xs text-[var(--color-text-light)] mt-1">
                      ثبت شده در: {new Date(appointment.createdAt).toLocaleDateString('fa-IR')}
                    </div>
                  </div>
                  <div>
                    {appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => void cancelAppointment(appointment.id)}
                        disabled={cancelling === appointment.id}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                      >
                        <XCircle size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}