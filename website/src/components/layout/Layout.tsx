import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { GlobalSearchProvider } from '@/components/common';

export function Layout() {
  return (
    <GlobalSearchProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    </GlobalSearchProvider>
  );
}
