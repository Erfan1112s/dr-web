// app/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      phone,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('شماره موبایل یا رمز عبور اشتباه است');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-bg)] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👩‍⚕️</div>
          <h1 className="text-3xl font-bold text-[var(--color-text-dark)]">ورود به پنل</h1>
          <p className="text-[var(--color-text-light)] mt-2">مطب تخصصی مامایی فرشته صادقی</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">شماره موبایل</label>
            <div className="relative">
              <Phone className="absolute right-3 top-3 text-gray-400" size={20} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none transition"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-2xl focus:border-[var(--color-primary)] focus:outline-none transition"
                placeholder="رمز عبور خود را وارد کنید"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white py-4 rounded-2xl text-lg font-medium transition-all hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            {loading ? 'در حال ورود...' : 'ورود به پنل'}
          </button>
        </form>
      </div>
    </div>
  );
}