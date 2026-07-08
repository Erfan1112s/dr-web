// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // اگر کاربر لاگین نکرده و به پنل دسترسی دارد → برگرد به لاگین
    if (!token && (path.startsWith('/dashboard') || path.startsWith('/admin'))) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // اگر کاربر نقش admin ندارد و می‌خواهد به /dashboard/admin برود → ممنوع
    if (path.startsWith('/dashboard/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // اگر کاربر نقش admin دارد و می‌خواهد به /dashboard برود → به admin هدایت شود
    if (path === '/dashboard' && token?.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};