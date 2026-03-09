'use client';

import { ProtectedRoute, Header, Footer, MobileNav } from '@/components/layout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav />
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
