// app/dashboard/admin/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, LogOut, Edit, Trash2 } from 'lucide-react';

type Appointment = {
  id: number;
  patientName: string;
  patientPhone: string;
  day: string;
  time: string;
  status: string;
  description?: string;
  createdAt: string;
  userId?: number;
};

type User = {
  id: number;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'appointments' | 'users'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    users: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
    fetchData();
  }, [status, session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, userRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/users'),
      ]);
      const appData = await appRes.json();
      const userData = await userRes.json();
      setAppointments(appData);
      setUsers(userData);

      const total = appData.length;
      const pending = appData.filter((a: Appointment) => a.status === 'pending').length;
      const confirmed = appData.filter((a: Appointment) => a.status === 'confirmed').length;
      const cancelled = appData.filter((a: Appointment) => a.status === 'cancelled').length;
      setStats({ total, pending, confirmed, cancelled, users: userData.length });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setAppointments(prev =>
          prev.map(a => a.id === id ? { ...a, status } : a)
        );
        fetchData();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('آیا از حذف این نوبت اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAppointments(prev => prev.filter(a => a.id !== id));
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
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
      <div className="container max-w-6xl mx-auto px-4">
        {/* هدر */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                👨‍💼 پنل مدیریت
              </h1>
              <p className="text-[var(--color-text-light)] text-sm">
                {session?.user?.name} عزیز خوش آمدید
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition px-4 py-2 bg-gray-100 rounded-full"
            >
              <LogOut size={18} />
              خروج از پنل
            </button>
          </div>
        </div>

        {/* آمار */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-[var(--color-primary)]">{stats.total}</div>
            <div className="text-xs text-[var(--color-text-light)]">کل نوبت‌ها</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <div className="text-xs text-[var(--color-text-light)]">در انتظار</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.confirmed}</div>
            <div className="text-xs text-[var(--color-text-light)]">تأیید شده</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.cancelled}</div>
            <div className="text-xs text-[var(--color-text-light)]">لغو شده</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.users}</div>
            <div className="text-xs text-[var(--color-text-light)]">کاربران</div>
          </div>
        </div>

        {/* تب‌ها */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-2 rounded-full transition ${
              activeTab === 'appointments'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-50'
            }`}
          >
            📋 نوبت‌ها
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-full transition ${
              activeTab === 'users'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-50'
            }`}
          >
            👤 کاربران
          </button>
        </div>

        {/* محتوای تب‌ها */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          {activeTab === 'appointments' && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-[var(--color-primary)]" />
                مدیریت نوبت‌ها
              </h2>
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-light)]">
                  <div className="text-6xl mb-4">📅</div>
                  <p>هیچ نوبتی ثبت نشده است</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right p-3">نام بیمار</th>
                        <th className="text-right p-3">موبایل</th>
                        <th className="text-right p-3">روز</th>
                        <th className="text-right p-3">ساعت</th>
                        <th className="text-right p-3">وضعیت</th>
                        <th className="text-right p-3">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((app) => (
                        <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-medium">{app.patientName}</td>
                          <td className="p-3 text-gray-600">{app.patientPhone}</td>
                          <td className="p-3">{app.day}</td>
                          <td className="p-3">{app.time}</td>
                          <td className="p-3">
                            <span
                              className={`text-xs px-3 py-1 rounded-full ${
                                app.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : app.status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {app.status === 'confirmed'
                                ? 'تأیید شده'
                                : app.status === 'cancelled'
                                ? 'لغو شده'
                                : 'در انتظار'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              {app.status === 'pending' && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              {app.status === 'pending' && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                >
                                  <XCircle size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteAppointment(app.id)}
                                className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-[var(--color-primary)]" />
                مدیریت کاربران
              </h2>
              {users.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-light)]">
                  <div className="text-6xl mb-4">👤</div>
                  <p>هیچ کاربری ثبت نشده است</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right p-3">نام</th>
                        <th className="text-right p-3">موبایل</th>
                        <th className="text-right p-3">نقش</th>
                        <th className="text-right p-3">تاریخ ثبت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-medium">{user.name}</td>
                          <td className="p-3 text-gray-600">{user.phone}</td>
                          <td className="p-3">
                            <span
                              className={`text-xs px-3 py-1 rounded-full ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {user.role === 'admin' ? 'مدیر' : 'بیمار'}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}