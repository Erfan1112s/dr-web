// app/dashboard/admin/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

// ============================================================
// تایپ‌ها
// ============================================================
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

type Stats = {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  today: number;
  week: number;
  month: number;
};

// ============================================================
// کامپوننت اصلی
// ============================================================
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State ها
  const [activeTab, setActiveTab] = useState<'appointments' | 'users' | 'stats'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    today: 0,
    week: 0,
    month: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // فیلترها
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // لاگین
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
    fetchAllData();
  }, [status, session]);

  // ============================================================
  // توابع دریافت داده
  // ============================================================
  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appRes, userRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/users'),
      ]);

      const appData = await appRes.json();
      const userData = await userRes.json();

      if (appRes.ok) {
        setAppointments(appData);
        calculateStats(appData);
      } else {
        setError('خطا در دریافت نوبت‌ها');
      }

      if (userRes.ok) {
        setUsers(userData);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // محاسبه آمار
  const calculateStats = (data: Appointment[]) => {
    const today = new Date().toLocaleDateString('fa-IR');
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date();
    monthStart.setDate(1);

    const total = data.length;
    const pending = data.filter((a) => a.status === 'pending').length;
    const confirmed = data.filter((a) => a.status === 'confirmed').length;
    const cancelled = data.filter((a) => a.status === 'cancelled').length;

    const todayCount = data.filter((a) => a.day === today).length;
    const weekCount = data.filter((a) => {
      const date = new Date(a.createdAt);
      return date >= weekStart;
    }).length;
    const monthCount = data.filter((a) => {
      const date = new Date(a.createdAt);
      return date >= monthStart;
    }).length;

    setStats({
      total,
      pending,
      confirmed,
      cancelled,
      today: todayCount,
      week: weekCount,
      month: monthCount,
    });
  };

  // ============================================================
  // فیلتر و مرتب‌سازی
  // ============================================================
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // فیلتر بر اساس جستجو
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.patientName.includes(searchTerm) ||
          a.patientPhone.includes(searchTerm)
      );
    }

    // فیلتر بر اساس وضعیت
    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    // فیلتر بر اساس روز
    if (filterDay !== 'all') {
      filtered = filtered.filter((a) => a.day === filterDay);
    }

    // مرتب‌سازی
    filtered.sort((a, b) => {
      if (sortField === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'name') {
        return sortOrder === 'desc'
          ? b.patientName.localeCompare(a.patientName)
          : a.patientName.localeCompare(b.patientName);
      }
      return 0;
    });

    return filtered;
  }, [appointments, searchTerm, filterStatus, filterDay, sortField, sortOrder]);

  // ============================================================
  // عملیات روی نوبت‌ها
  // ============================================================
  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
        calculateStats(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
      }
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      alert('خطا در به‌روزرسانی نوبت');
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('آیا از حذف این نوبت اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('❌ Error deleting appointment:', error);
      alert('خطا در حذف نوبت');
    }
  };

  // ============================================================
  // رندر
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    );
  }

  const days = Array.from(new Set(appointments.map((a) => a.day)));

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* ========== هدر ========== */}
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
            <div className="flex gap-3">
              <button
                onClick={fetchAllData}
                className="flex items-center gap-2 text-[var(--color-primary)] px-4 py-2 bg-[var(--color-primary-lighter)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition"
              >
                <RefreshCw size={18} />
                بروزرسانی
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition px-4 py-2 bg-gray-100 rounded-full"
              >
                <LogOut size={18} />
                خروج
              </button>
            </div>
          </div>

          {/* پیام خطا */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl">
              {error}
            </div>
          )}
        </div>

        {/* ========== کارت‌های آمار ========== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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
            <div className="text-2xl font-bold text-blue-500">{stats.today}</div>
            <div className="text-xs text-[var(--color-text-light)]">امروز</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.month}</div>
            <div className="text-xs text-[var(--color-text-light)]">این ماه</div>
          </div>
        </div>

        {/* ========== تب‌ها ========== */}
        <div className="flex flex-wrap gap-2 mb-6">
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
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2 rounded-full transition ${
              activeTab === 'stats'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-50'
            }`}
          >
            📊 آمار پیشرفته
          </button>
        </div>

        {/* ========== محتوای تب‌ها ========== */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          {/* ===== تب نوبت‌ها ===== */}
          {activeTab === 'appointments' && (
            <div>
              {/* نوار جستجو و فیلتر */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو بر اساس نام یا موبایل..."
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none transition"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none transition bg-white"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="pending">در انتظار</option>
                  <option value="confirmed">تأیید شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none transition bg-white"
                >
                  <option value="all">همه روزها</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* جدول نوبت‌ها */}
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-light)]">
                  <div className="text-6xl mb-4">📅</div>
                  <p>هیچ نوبتی با این فیلترها یافت نشد</p>
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
                        <th className="text-right p-3">تاریخ ثبت</th>
                        <th className="text-right p-3">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((app) => (
                        <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
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
                          <td className="p-3 text-gray-600">
                            {new Date(app.createdAt).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {app.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                                    className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition"
                                    title="تأیید"
                                  >
                                    <CheckCircle size={18} />
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                                    className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                                    title="لغو"
                                  >
                                    <XCircle size={18} />
                                  </button>
                                </>
                              )}
                              {app.status === 'confirmed' && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                                  className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                                  title="لغو"
                                >
                                  <XCircle size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteAppointment(app.id)}
                                className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
                                title="حذف"
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

              <div className="mt-4 text-sm text-[var(--color-text-light)]">
                {filteredAppointments.length} نوبت از {appointments.length} نوبت
              </div>
            </div>
          )}

          {/* ===== تب کاربران ===== */}
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
                        <th className="text-right p-3">تعداد نوبت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const userAppointments = appointments.filter(
                          (a) => a.patientPhone === user.phone
                        );
                        return (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
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
                            <td className="p-3 text-center">{userAppointments.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== تب آمار پیشرفته ===== */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                📊 آمار پیشرفته
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* کارت وضعیت نوبت‌ها */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">وضعیت نوبت‌ها</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-light)]">در انتظار تأیید</span>
                      <span className="font-bold text-yellow-500">{stats.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-light)]">تأیید شده</span>
                      <span className="font-bold text-green-500">{stats.confirmed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-light)]">لغو شده</span>
                      <span className="font-bold text-red-500">{stats.cancelled}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3 mt-3">
                      <span className="font-medium">مجموع</span>
                      <span className="font-bold text-[var(--color-primary)]">{stats.total}</span>
                    </div>
                  </div>
                </div>

                {/* کارت بازه زمانی */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">بازه زمانی</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-light)]">نوبت‌های امروز</span>
                      <span className="font-bold text-blue-500">{stats.today}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-light)]">نوبت‌های این هفته</span>
                      <span className="font-bold text-indigo-500">{stats.week}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-light)]">نوبت‌های این ماه</span>
                      <span className="font-bold text-purple-500">{stats.month}</span>
                    </div>
                  </div>
                </div>

                {/* کارت اطلاعات کلی */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">اطلاعات کلی</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-light)]">تعداد کاربران</span>
                      <span className="font-bold text-[var(--color-primary)]">{users.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-light)]">میانگین نوبت هر کاربر</span>
                      <span className="font-bold text-[var(--color-primary)]">
                        {users.length > 0 ? (stats.total / users.length).toFixed(1) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3 mt-3">
                      <span className="text-[var(--color-text-light)]">نرخ تأیید</span>
                      <span className="font-bold text-green-500">
                        {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}