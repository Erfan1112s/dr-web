// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // اجازه دسترسی به api/auth
    if (path.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // اگر لاگین نیست و به پنل رفته → ببر به لاگین
    if (!token && path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // اگر کاربر عادی (patient) به /dashboard/admin رفته → ببر به /dashboard
    if (path.startsWith('/dashboard/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // اگر ادمین به /dashboard رفته → ببر به /dashboard/admin
    if (path === '/dashboard' && token?.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', req.url));
    }

    // اگر کاربر عادی به /dashboard رفته → اجازه بده (پنل کاربری خودش)
    if (path === '/dashboard' && token?.role === 'patient') {
      return NextResponse.next();
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