import { useEffect } from 'react';
import CustomerNavbar from './CustomerNavbar';
import Footer from './Footer';

export default function StaticPageLayout({ title, children }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream font-sans">
      <CustomerNavbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 page-enter">
        {title && (
          <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-charcoal mb-8 pb-4 border-b border-charcoal/10">
            {title}
          </h1>
        )}
        <div className="prose prose-charcoal max-w-none text-charcoal/80 space-y-6 text-lg leading-relaxed">
          {children}
        </div>
      </main>
      <Footer variant="dark" />
    </div>
  );
}
