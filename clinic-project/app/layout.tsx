// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import ChatWidget from './components/ChatWidget';
import Footer from './components/ui/footer';


export const metadata: Metadata = {
  title: 'نوبت‌دهی آنلاین مامایی خمینی‌شهر | فرشته صادقی',
  description: 'مطب فرشته صادقی - کارشناس مامایی در خمینی‌شهر',
  // ... بقیه metadata
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
