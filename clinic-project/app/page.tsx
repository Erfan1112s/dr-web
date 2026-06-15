import ChatWidget from './components/ChatWidget';
import Header from './components/ui/Header';
import Hero from './components/ui/Hero';
import Services from './components/ui/services';
import About from './components/ui/About';
import FAQ from './components/ui/FAQ';
import Contact from './components/ui/contect';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <FAQ />
        <Contact />
      </main>
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <FloatingBookButton />  
        <ChatWidget />         
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}