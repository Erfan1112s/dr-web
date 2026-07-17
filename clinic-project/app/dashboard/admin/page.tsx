// app/dashboard/admin/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle, XCircle, LogOut, Trash2, RefreshCw } from 'lucide-react';

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
  id?: number;
  sessionId: string;
  userId?: number;
  userMsg: string;
  botMsg: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    id?: number;
    name?: string;
    phone?: string;
  };
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
};

type Tab = 'appointments' | 'users' | 'chats';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('appointments');
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
  const [chatMessages, setChatMessages] = useState<ChatGroup[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatGroup | null>(null);
  const [chatReply, setChatReply] = useState('');

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

  const fetchChatMessages = async () => {
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat/admin');
      const data = await res.json();
      if (res.ok) {
        const groups: ChatGroup[] = Object.entries(data.groups || {}).map(([sessionId, msgs]) => {
          const typedMessages = (Array.isArray(msgs) ? msgs : []) as ChatMessage[];
          const lastMsg = typedMessages[0] ?? { userMsg: '', createdAt: new Date().toISOString(), isRead: false };
          const user = lastMsg.user;
          return {
            sessionId,
            userId: user?.id,
            userName: user?.name || 'کاربر مهمان',
            userPhone: user?.phone || '-',
            messages: typedMessages,
            lastMessage: lastMsg.userMsg || '',
            createdAt: lastMsg.createdAt || new Date().toISOString(),
            isRead: typedMessages.some((message) => !message.isRead),
          };
        });
        setChatMessages(groups);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setChatLoading(false);
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
        setAppointments((prev) => prev.map((appointment) => (appointment.id === id ? { ...appointment, status } : appointment)));
        void fetchData();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!window.confirm('آیا از حذف این نوبت اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
        void fetchData();
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const replyToChat = async (sessionId: string, reply: string) => {
    if (!reply.trim()) return;
    window.alert(`پاسخ به ${sessionId}: ${reply}`);
    setChatReply('');
  };

  useEffect(() => {
    if (status === 'loading') return;

    const loadDashboardData = async () => {
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      await fetchData();
    };

    void loadDashboardData();
  }, [router, session?.user?.role, status]);

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
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">👨‍💼 پنل مدیریت</h1>
              <p className="text-[var(--color-text-light)] text-sm">{session?.user?.name} عزیز خوش آمدید</p>
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
            onClick={() => {
              setActiveTab('chats');
              void fetchChatMessages();
            }}
            className={`px-6 py-2 rounded-full transition ${
              activeTab === 'chats'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-50'
            }`}
          >
            💬 چت‌ها
            {chatMessages.some((chat) => !chat.isRead) && (
              <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center">
                {chatMessages.filter((chat) => !chat.isRead).length}
              </span>
            )}
          </button>
        </div>

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
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-medium">{appointment.patientName}</td>
                          <td className="p-3 text-gray-600">{appointment.patientPhone}</td>
                          <td className="p-3">{appointment.day}</td>
                          <td className="p-3">{appointment.time}</td>
                          <td className="p-3">
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
                                : 'در انتظار'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              {appointment.status === 'pending' && (
                                <button
                                  onClick={() => void updateAppointmentStatus(appointment.id, 'confirmed')}
                                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              {appointment.status === 'pending' && (
                                <button
                                  onClick={() => void updateAppointmentStatus(appointment.id, 'cancelled')}
                                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                >
                                  <XCircle size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => void deleteAppointment(appointment.id)}
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
                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {user.role === 'admin' ? 'مدیر' : 'بیمار'}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chats' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">💬 مدیریت چت‌ها</h2>
                <button
                  onClick={() => void fetchChatMessages()}
                  className="flex items-center gap-2 text-[var(--color-primary)] px-4 py-2 bg-[var(--color-primary-lighter)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition"
                >
                  <RefreshCw size={18} />
                  بروزرسانی
                </button>
              </div>

              {chatLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent"></div>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-light)]">
                  <div className="text-6xl mb-4">💬</div>
                  <p>هنوز هیچ پیامی در چت ثبت نشده است</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {chatMessages.map((group) => (
                      <div
                        key={group.sessionId}
                        onClick={() => setSelectedChat(group)}
                        className={`p-4 rounded-2xl border cursor-pointer transition ${
                          selectedChat?.sessionId === group.sessionId
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!group.isRead ? 'bg-yellow-50' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {group.userName}
                              {!group.isRead && (
                                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full mr-2">جدید</span>
                              )}
                            </div>
                            <div className="text-sm text-[var(--color-text-light)]">{group.userPhone}</div>
                          </div>
                          <div className="text-xs text-[var(--color-text-light)]">
                            {new Date(group.createdAt).toLocaleDateString('fa-IR')}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2 line-clamp-2">{group.lastMessage}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 max-h-[600px] flex flex-col">
                    {selectedChat ? (
                      <>
                        <div className="border-b border-gray-200 pb-3 mb-3">
                          <div className="font-bold">{selectedChat.userName}</div>
                          <div className="text-sm text-[var(--color-text-light)]">
                            {selectedChat.userPhone} • {selectedChat.messages.length} پیام
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                          {selectedChat.messages.map((message, index) => (
                            <div key={`${message.sessionId}-${index}`}>
                              <div className="bg-white rounded-2xl p-3 shadow-sm">
                                <div className="text-sm font-medium text-[var(--color-primary)]">کاربر:</div>
                                <div className="text-sm text-gray-700">{message.userMsg}</div>
                              </div>
                              <div className="bg-[var(--color-primary-bg)] rounded-2xl p-3 shadow-sm mt-2">
                                <div className="text-sm font-medium text-[var(--color-primary)]">چت‌بات:</div>
                                <div className="text-sm text-gray-700">{message.botMsg}</div>
                              </div>
                              <div className="text-xs text-[var(--color-text-light)] text-left mt-1">
                                {new Date(message.createdAt).toLocaleString('fa-IR')}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={chatReply}
                              onChange={(event) => setChatReply(event.target.value)}
                              placeholder="پاسخ به کاربر..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none"
                            />
                            <button
                              onClick={() => void replyToChat(selectedChat.sessionId, chatReply)}
                              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-2xl hover:bg-[var(--color-primary-dark)] transition"
                            >
                              ارسال
                            </button>
                          </div>
                          <div className="text-xs text-[var(--color-text-light)] mt-2">
                            ⚠️ این پاسخ فعلاً به صورت اطلاع‌رسانی است. برای ارسال واقعی، API ارسال پیام باید پیاده‌سازی شود.
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
        </div>
      </div>
    </div>
  );
}
