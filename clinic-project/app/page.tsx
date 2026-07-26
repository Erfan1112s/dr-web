// app/page.tsx
import Header from './components/ui/Header';
import Hero from './components/ui/Hero';
import Stats from './components/ui/stats';
import Services from './components/ui/services';
import ArticlesPreview from './components/ui/ArticlesPreview';
import Testimonials from './components/ui/Testimonials';
import Contact from './components/ui/contect';
import Footer from './components/ui/footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Services />
        <ArticlesPreview />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}