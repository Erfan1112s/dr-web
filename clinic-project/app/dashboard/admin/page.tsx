// app/dashboard/admin/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  RefreshCw,
  Search,
  Send,
  MessageCircle,
  FileText,
  Reply,
  Power,
  PowerOff,
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

type ChatMessage = {
  id: number;
  sessionId: string;
  userId?: number;
  userMsg: string;
  botMsg: string;
  adminReply?: string;
  botDisabled?: boolean;
  isRead: boolean;
  createdAt: string;
  user?: { name: string; phone: string };
};

type ChatGroup = {
  sessionId: string;
  userId?: number;
  userName?: string;
  userPhone?: string;
  messages: ChatMessage[];
  lastMessage: string;
  createdAt: string;
  isRead: boolean;
  hasAdminReply: boolean;
  botDisabled: boolean;
};

type Article = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  category: string;
  views: number;
  publishedAt: string;
};

type Comment = {
  id: number;
  content: string;
  author: string;
  email?: string;
  isApproved: boolean;
  adminReply?: string;
  createdAt: string;
  article: { title: string; slug: string };
  user?: { name: string };
};

// ============================================================
// کامپوننت اصلی
// ============================================================
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // -------- State‌ها --------
  const [activeTab, setActiveTab] = useState<
    'appointments' | 'users' | 'chats' | 'articles' | 'comments'
  >('appointments');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // فیلترهای نوبت‌ها
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDay, setFilterDay] = useState('all');

  // چت
  const [selectedChat, setSelectedChat] = useState<ChatGroup | null>(null);
  const [chatReply, setChatReply] = useState('');

  // پاسخ به نظرات
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // آمار
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    users: 0,
  });

  // ============================================================
  // useEffect: احراز هویت
  // ============================================================
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
  // دریافت همه داده‌ها (برای بار اول یا رفرش کامل)
  // ============================================================
  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appRes, userRes, chatRes, articleRes, commentRes] = await Promise.all([
        fetch('/api/appointments', { cache: 'no-store' }),
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/chat/admin', { cache: 'no-store' }),
        fetch('/api/articles?limit=100', { cache: 'no-store' }),
        fetch('/api/comments/admin', { cache: 'no-store' }),
      ]);

      const appData = appRes.ok ? await appRes.json() : [];
      const userData = userRes.ok ? await userRes.json() : [];
      const chatData = chatRes.ok ? await chatRes.json() : {};
      const articleData = articleRes.ok ? await articleRes.json() : { articles: [] };
      const commentData = commentRes.ok ? await commentRes.json() : [];

      setAppointments(appData);
      setUsers(userData);
      setArticles(articleData.articles || []);
      setComments(commentData);

      // محاسبه آمار
      const total = appData.length;
      const pending = appData.filter((a: Appointment) => a.status === 'pending').length;
      const confirmed = appData.filter((a: Appointment) => a.status === 'confirmed').length;
      const cancelled = appData.filter((a: Appointment) => a.status === 'cancelled').length;
      setStats({ total, pending, confirmed, cancelled, users: userData.length });

      // گروه‌بندی چت‌ها
      if (chatData.groups) {
        const chatGroupsData = Array.isArray(chatData.groups)
          ? chatData.groups
          : Object.entries(chatData.groups).map(([sessionId, messages]) => ({
              sessionId,
              messages,
            }));

        const groups: ChatGroup[] = chatGroupsData.map((group: any) => {
          const msgs = Array.isArray(group.messages) ? group.messages : [];
          const lastMsg = msgs[0] || {};
          const user = lastMsg.user;

          return {
            sessionId: group.sessionId,
            userId: group.userId ?? user?.id,
            userName: group.userName || user?.name || 'کاربر مهمان',
            userPhone: group.userPhone || user?.phone || '-',
            messages: msgs,
            lastMessage: group.lastMessage || lastMsg.userMsg || '',
            createdAt: group.createdAt || lastMsg.createdAt || new Date().toISOString(),
            isRead: group.isRead ?? msgs.some((m: any) => !m.isRead),
            hasAdminReply: msgs.some((m: any) => m.adminReply !== null && m.adminReply !== ''),
            botDisabled: msgs.some((m: any) => m.botDisabled === true),
          };
        });
        setChatGroups(groups);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // دریافت فقط چت‌ها (سبک‌تر برای پولینگ)
  // ============================================================
  const fetchChatGroupsOnly = async () => {
    try {
      const res = await fetch('/api/chat/admin', { cache: 'no-store' });
      if (!res.ok) return;

      const chatData = await res.json();
      if (!chatData.groups) return;

      const groups: ChatGroup[] = (Array.isArray(chatData.groups) ? chatData.groups : []).map(
        (group: any) => {
          const msgs = Array.isArray(group.messages) ? group.messages : [];
          const lastMsg = msgs[0] || {};
          const user = lastMsg.user;

          return {
            sessionId: group.sessionId,
            userId: group.userId ?? user?.id,
            userName: group.userName || user?.name || 'کاربر مهمان',
            userPhone: group.userPhone || user?.phone || '-',
            messages: msgs,
            lastMessage: group.lastMessage || lastMsg.userMsg || '',
            createdAt: group.createdAt || lastMsg.createdAt || new Date().toISOString(),
            isRead: group.isRead ?? msgs.some((m: any) => !m.isRead),
            hasAdminReply: msgs.some((m: any) => m.adminReply !== null && m.adminReply !== ''),
            botDisabled: msgs.some((m: any) => m.botDisabled === true),
          };
        }
      );

      setChatGroups(groups);

      // اگر مکالمه‌ای باز است، آن را هم آپدیت کن
      setSelectedChat((prev) => {
        if (!prev) return prev;
        const updated = groups.find((g) => g.sessionId === prev.sessionId);
        return updated || prev;
      });
    } catch (error) {
      console.error('❌ Error updating chats:', error);
    }
  };

  // ============================================================
  // پولینگ هوشمند فقط وقتی تب چت فعال است
  // ============================================================
  useEffect(() => {
    if (activeTab !== 'chats') return;

    // یک‌بار فوری
    fetchChatGroupsOnly();

    // هر ۱۲ ثانیه یک‌بار
    const intervalId = setInterval(() => {
      fetchChatGroupsOnly();
    }, 12000);

    return () => clearInterval(intervalId);
  }, [activeTab]);

  // ============================================================
  // توابع مدیریت نوبت‌ها
  // ============================================================
  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
        cache: 'no-store',
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
        fetchAllData();
      }
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      alert('خطا در به‌روزرسانی نوبت');
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('آیا از حذف این نوبت اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/appointments?id=${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        fetchAllData();
      }
    } catch (error) {
      console.error('❌ Error deleting appointment:', error);
      alert('خطا در حذف نوبت');
    }
  };

  // ============================================================
  // توابع مدیریت مقالات
  // ============================================================
  const deleteArticle = async (id: number) => {
    if (!confirm('آیا از حذف این مقاله اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('❌ Error deleting article:', error);
      alert('خطا در حذف مقاله');
    }
  };

  // ============================================================
  // توابع مدیریت نظرات
  // ============================================================
  const approveComment = async (id: number) => {
    try {
      const res = await fetch('/api/comments/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: true }),
        cache: 'no-store',
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isApproved: true } : c))
        );
      }
    } catch (error) {
      console.error('❌ Error approving comment:', error);
      alert('خطا در تایید نظر');
    }
  };

  const deleteComment = async (id: number) => {
    if (!confirm('آیا از حذف این نظر اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/comments/admin?id=${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      alert('خطا در حذف نظر');
    }
  };

  // پاسخ به نظر
  const replyToComment = async (id: number, reply: string) => {
    if (!reply.trim()) return;

    try {
      const res = await fetch('/api/comments/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, adminReply: reply, isApproved: true }),
        cache: 'no-store',
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, adminReply: reply, isApproved: true } : c
          )
        );
        setReplyingTo(null);
        setReplyContent('');
      }
    } catch (error) {
      console.error('❌ Error replying to comment:', error);
      alert('خطا در ارسال پاسخ');
    }
  };

  // ============================================================
  // توابع مدیریت چت
  // ============================================================
  const toggleBot = async (sessionId: string, enable: boolean) => {
    const action = enable ? 'فعال' : 'غیرفعال';
    if (!confirm(`آیا از ${action}سازی ربات برای این کاربر اطمینان دارید؟`)) return;

    try {
      const endpoint = enable
        ? '/api/chat/admin/enable-bot'
        : '/api/chat/admin/disable-bot';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
        cache: 'no-store',
      });

      if (res.ok) {
        alert(`✅ ربات با موفقیت ${action} شد`);
        fetchAllData();
        if (selectedChat && selectedChat.sessionId === sessionId) {
          setSelectedChat((prev) =>
            prev ? { ...prev, botDisabled: !enable } : null
          );
        }
      } else {
        alert(`❌ خطا در ${action}سازی ربات`);
      }
    } catch (error) {
      console.error('❌ Error toggling bot:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const sendAdminReply = async (messageId: number, reply: string) => {
    if (!reply.trim()) return;

    try {
      const res = await fetch('/api/chat/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, reply }),
        cache: 'no-store',
      });

      if (res.ok) {
        setChatReply('');
        await fetchAllData();
        // بروزرسانی مکالمه انتخاب‌شده
        if (selectedChat) {
          const updated = await fetch('/api/chat/admin', { cache: 'no-store' }).then(
            (r) => r.json()
          );
          const newGroups = updated.groups || [];
          const updatedGroup = newGroups.find(
            (g: any) => g.sessionId === selectedChat.sessionId
          );
          if (updatedGroup) {
            setSelectedChat(updatedGroup);
          }
        }
      } else {
        alert('خطا در ارسال پاسخ');
      }
    } catch (error) {
      console.error('❌ Error sending reply:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  // ============================================================
  // فیلتر نوبت‌ها
  // ============================================================
  const filteredAppointments = appointments
    .filter((a) => {
      if (searchTerm) {
        return (
          a.patientName.includes(searchTerm) ||
          a.patientPhone.includes(searchTerm)
        );
      }
      return true;
    })
    .filter((a) => (filterStatus === 'all' ? true : a.status === filterStatus))
    .filter((a) => (filterDay === 'all' ? true : a.day === filterDay))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const days = Array.from(new Set(appointments.map((a) => a.day)));

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
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  if (activeTab === 'chats') {
                    fetchChatGroupsOnly();
                  } else {
                    fetchAllData();
                  }
                }}
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
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl">
              {error}
            </div>
          )}
        </div>

        {/* ========== کارت‌های آمار ========== */}
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

        {/* ========== تب‌ها ========== */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-5 py-2 rounded-full transition text-sm ${
              activeTab === 'appointments'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-50'
            }`}
          >
            📋 نوبت‌ها
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2 rounded-full transition text-sm ${
              activeTab === 'users'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-50'
            }`}
          >
            👤 کاربران
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-5 py-2 rounded-full transition text-sm ${
              activeTab === 'chats'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-50'
            }`}
          >
            💬 چت‌ها
            {chatGroups.filter((c) => !c.isRead).length > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center mr-1">
                {chatGroups.filter((c) => !c.isRead).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-5 py-2 rounded-full transition text-sm ${
              activeTab === 'articles'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-50'
            }`}
          >
            📝 مقالات
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-5 py-2 rounded-full transition text-sm ${
              activeTab === 'comments'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-50'
            }`}
          >
            💬 نظرات
            {comments.filter((c) => !c.isApproved).length > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center mr-1">
                {comments.filter((c) => !c.isApproved).length}
              </span>
            )}
          </button>
        </div>

        {/* ========== محتوای تب‌ها ========== */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          {/* ===== تب نوبت‌ها ===== */}
          {activeTab === 'appointments' && (
            <div>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو بر اساس نام یا موبایل..."
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none bg-white"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="pending">در انتظار</option>
                  <option value="confirmed">تأیید شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none bg-white"
                >
                  <option value="all">همه روزها</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

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
                        const userApps = appointments.filter(
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
                            <td className="p-3 text-center">{userApps.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== تب چت‌ها ===== */}
          {activeTab === 'chats' && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="text-[var(--color-primary)]" />
                مدیریت چت‌ها
              </h2>
              {chatGroups.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-light)]">
                  <div className="text-6xl mb-4">💬</div>
                  <p>هیچ گفتگویی ثبت نشده است</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {chatGroups.map((group) => (
                      <button
                        key={group.sessionId}
                        type="button"
                        onClick={() => {
                          setSelectedChat(group);
                          setChatReply('');
                        }}
                        className={`w-full text-right rounded-2xl p-4 border transition ${
                          selectedChat?.sessionId === group.sessionId
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-lighter)]'
                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              {group.userName}
                              {!group.isRead && (
                                <span className="w-2 h-2 bg-red-500 rounded-full" />
                              )}
                              {group.botDisabled && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  ربات خاموش
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[var(--color-text-light)]">
                              {group.userPhone}
                            </div>
                          </div>
                          <div className="text-xs text-[var(--color-text-light)]">
                            {new Date(group.createdAt).toLocaleDateString('fa-IR')}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {group.lastMessage || 'بدون پیام'}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-4 max-h-[600px] flex flex-col">
                    {selectedChat ? (
                      <>
                        <div className="border-b border-gray-200 pb-3 mb-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold">{selectedChat.userName}</div>
                              <div className="text-sm text-[var(--color-text-light)]">
                                {selectedChat.userPhone} • {selectedChat.messages.length} پیام
                              </div>
                            </div>
                            {/* دکمه فعال/غیرفعال‌سازی ربات */}
                            <button
                              onClick={() =>
                                toggleBot(selectedChat.sessionId, selectedChat.botDisabled)
                              }
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                                selectedChat.botDisabled
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              }`}
                            >
                              {selectedChat.botDisabled ? (
                                <>
                                  <Power size={14} />
                                  فعال‌سازی ربات
                                </>
                              ) : (
                                <>
                                  <PowerOff size={14} />
                                  غیرفعال‌سازی ربات
                                </>
                              )}
                            </button>
                          </div>
                          {selectedChat.botDisabled && (
                            <div className="text-xs text-amber-600 mt-1">
                              ⏸️ ربات برای این کاربر غیرفعال است. کاربر پیام «کارشناس در حال بررسی است» را می‌بیند.
                            </div>
                          )}
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                          {selectedChat.messages.map((msg: any, idx: number) => (
                            <div key={msg.id ?? idx}>
                              <div className="bg-white rounded-2xl p-3 shadow-sm">
                                <div className="text-sm font-medium text-[var(--color-primary)]">کاربر:</div>
                                <div className="text-sm text-gray-700">{msg.userMsg}</div>
                              </div>

                              {msg.botMsg && (
                                <div className="bg-[var(--color-primary-bg)] rounded-2xl p-3 shadow-sm mt-2">
                                  <div className="text-sm font-medium text-[var(--color-primary)] flex items-center gap-2">
                                    چت‌بات:
                                    {msg.botDisabled && (
                                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                        غیرفعال
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-700">{msg.botMsg}</div>
                                </div>
                              )}

                              {msg.adminReply && (
                                <div className="bg-green-50 rounded-2xl p-3 shadow-sm mt-2 border-r-4 border-green-500">
                                  <div className="text-sm font-medium text-green-700">پاسخ ادمین:</div>
                                  <div className="text-sm text-gray-700">{msg.adminReply}</div>
                                </div>
                              )}

                              <div className="text-xs text-[var(--color-text-light)] text-left mt-1">
                                {new Date(msg.createdAt).toLocaleString('fa-IR')}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={chatReply}
                              onChange={(e) => setChatReply(e.target.value)}
                              placeholder="پاسخ به کاربر..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                // پیدا کردن آخرین پیامی که هنوز پاسخ ندارد
                                const lastUnreplied = selectedChat.messages
                                  .filter((m: any) => m.userMsg && !m.adminReply)
                                  .pop();
                                if (lastUnreplied) {
                                  sendAdminReply(lastUnreplied.id, chatReply);
                                } else {
                                  alert('هیچ پیام بدون پاسخی برای این کاربر وجود ندارد.');
                                }
                              }}
                              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-2xl hover:bg-[var(--color-primary-dark)] transition"
                              title="ارسال پاسخ"
                            >
                              <Send size={18} />
                            </button>
                          </div>
                          <div className="text-xs text-[var(--color-text-light)] mt-2">
                            💡 پاسخ به آخرین پیام کاربر که هنوز پاسخ داده نشده است.
                            {selectedChat.botDisabled && (
                              <span className="block text-amber-600">
                                ⚠️ ربات غیرفعال است. با ارسال پاسخ، وضعیت تغییری نمی‌کند.
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-[var(--color-text-light)]">
                        <div className="text-center">
                          <div className="text-4xl mb-3">💬</div>
                          <p>یک مکالمه را انتخاب کنید</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== تب مقالات ===== */}
          {activeTab === 'articles' && (
            <div>
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  📝 مدیریت مقالات
                </h2>
                <Link
                  href="/dashboard/admin/articles/new"
                  className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-full hover:shadow-lg transition"
                >
                  <Plus size={18} />
                  مقاله جدید
                </Link>
              </div>

              {articles.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-light)]">
                  <div className="text-6xl mb-4">📝</div>
                  <p>هیچ مقاله‌ای منتشر نشده است</p>
                  <Link
                    href="/dashboard/admin/articles/new"
                    className="text-[var(--color-primary)] hover:underline mt-2 inline-block"
                  >
                    اولین مقاله را بنویسید
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right p-3">عنوان</th>
                        <th className="text-right p-3">دسته‌بندی</th>
                        <th className="text-right p-3">بازدید</th>
                        <th className="text-right p-3">تاریخ</th>
                        <th className="text-right p-3">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article) => (
                        <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="p-3 font-medium">{article.title}</td>
                          <td className="p-3">
                            <span className="text-xs px-3 py-1 bg-[var(--color-primary-lighter)] text-[var(--color-primary)] rounded-full">
                              {article.category}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600">{article.views}</td>
                          <td className="p-3 text-gray-600">
                            {new Date(article.publishedAt).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/articles/${article.slug}`}
                                target="_blank"
                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                                title="مشاهده"
                              >
                                <Eye size={18} />
                              </Link>
                              <Link
                                href={`/dashboard/admin/articles/${article.id}/edit`}
                                className="p-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition"
                                title="ویرایش"
                              >
                                <Edit size={18} />
                              </Link>
                              <button
                                onClick={() => deleteArticle(article.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
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
            </div>
          )}

          {/* ===== تب نظرات ===== */}
          {activeTab === 'comments' && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                💬 مدیریت نظرات
              </h2>

              {comments.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-light)]">
                  <div className="text-6xl mb-4">💬</div>
                  <p>هیچ نظری ثبت نشده است</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right p-3">نویسنده</th>
                        <th className="text-right p-3">متن نظر</th>
                        <th className="text-right p-3">مقاله</th>
                        <th className="text-right p-3">وضعیت</th>
                        <th className="text-right p-3">پاسخ ادمین</th>
                        <th className="text-right p-3">تاریخ</th>
                        <th className="text-right p-3">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.map((comment) => (
                        <tr key={comment.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="p-3 font-medium">{comment.author}</td>
                          <td className="p-3 text-gray-600 max-w-[200px] truncate">
                            {comment.content}
                          </td>
                          <td className="p-3">
                            <Link
                              href={`/articles/${comment.article.slug}`}
                              target="_blank"
                              className="text-[var(--color-primary)] hover:underline"
                            >
                              {comment.article.title}
                            </Link>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs px-3 py-1 rounded-full ${
                                comment.isApproved
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {comment.isApproved ? 'تأیید شده' : 'در انتظار'}
                            </span>
                          </td>
                          <td className="p-3">
                            {comment.adminReply ? (
                              <span className="text-xs text-green-600">✅ پاسخ داده شده</span>
                            ) : (
                              <span className="text-xs text-gray-400">بدون پاسخ</span>
                            )}
                          </td>
                          <td className="p-3 text-gray-600">
                            {new Date(comment.createdAt).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {!comment.isApproved && (
                                <button
                                  onClick={() => approveComment(comment.id)}
                                  className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition"
                                  title="تأیید"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition"
                                title="پاسخ"
                              >
                                <Reply size={18} />
                              </button>
                              <button
                                onClick={() => deleteComment(comment.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                                title="حذف"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            {/* فرم پاسخ */}
                            {replyingTo === comment.id && (
                              <div className="mt-3 flex gap-2">
                                <input
                                  type="text"
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="پاسخ خود را وارد کنید..."
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                />
                                <button
                                  onClick={() => replyToComment(comment.id, replyContent)}
                                  className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl hover:bg-[var(--color-primary-dark)] transition text-sm"
                                >
                                  <Send size={16} />
                                </button>
                              </div>
                            )}
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