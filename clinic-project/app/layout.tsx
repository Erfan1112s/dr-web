// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'نوبت‌دهی آنلاین مامایی خمینی‌شهر | زهره بصارت',
  description: 'مطب زهره بصارت - کارشناس مامایی در خمینی‌شهر. مراقبت بارداری، بیماری‌های زنان، IUD، پاپ اسمیر و مشاوره تخصصی.',
  keywords: ['ماما خمینی‌شهر', 'مامایی اصفهان', 'نوبت ماما', 'IUD خمینی‌شهر', 'زهره بصارت', 'پاپ اسمیر'],
  authors: [{ name: 'زهره بصارت' }],
  openGraph: {
    title: 'نوبت‌دهی آنلاین مامایی خمینی‌شهر | زهره بصارت',
    description: 'مراقبت گرم و حرفه‌ای از شما و فرزندتان',
    images: [{ url: 'https://picsum.photos/id/1015/1200/630' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

