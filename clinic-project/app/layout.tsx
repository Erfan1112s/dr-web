// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Footer from './components/ui/footer';
import ChatWidget from './components/ChatWidget';

export const metadata: Metadata = {
  title: 'نوبت‌دهی آنلاین مامایی خمینی‌شهر | فرشته صادقی',
  description: 'مطب فرشته صادقی - کارشناس مامایی در خمینی‌شهر',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Providers>
          {children}
          <ChatWidget />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}