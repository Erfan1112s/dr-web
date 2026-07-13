// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // ✅ مسیرهای API احراز هویت رو نادیده بگیر (اجازه بده همیشه کار کنن)
    if (path.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // اگه کاربر لاگین نکرده و به پنل رفته → ببر به لاگین
    if (!token && (path.startsWith('/dashboard') || path.startsWith('/admin'))) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // اگه کاربر عادی بخواد بره به پنل ادمین → ممنوع
    if (path.startsWith('/dashboard/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // اگه ادمین به داشبورد عادی رفت → ببر به ادمین
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
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/auth/:path*'],
};