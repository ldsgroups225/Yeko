import { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileSidebar } from './mobile-sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
      <div className="flex flex-1">
        <Sidebar />
        <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="flex-1 overflow-auto">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
