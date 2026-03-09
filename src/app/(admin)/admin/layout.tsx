'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout';

const adminNav = [
  { href: '/admin', label: '統計概要', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/admin/users', label: 'ユーザー管理', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
  { href: '/admin/revenue', label: '売上管理', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/admin/subscriptions', label: 'サブスク管理', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 glass border-b border-border-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white font-bold text-xs">A</div>
                <span className="font-bold text-accent">Admin</span>
              </Link>
            </div>
            <Link href="/dashboard" className="text-sm text-text-muted hover:text-foreground transition-colors">
              アプリに戻る
            </Link>
          </div>
        </header>

        <div className="flex flex-1">
          <aside className="hidden md:block w-56 border-r border-border-light bg-surface/50 p-4">
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-text-muted hover:text-foreground hover:bg-surface-light'
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 p-4 sm:p-6 max-w-6xl">
            {/* Mobile nav */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
              {adminNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive ? 'bg-accent/10 text-accent' : 'bg-surface-light text-text-muted'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
