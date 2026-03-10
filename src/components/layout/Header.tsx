'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Avatar, Button } from '@/components/ui';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass border-b border-border-light safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <span className="text-lg font-bold gradient-text hidden sm:block">BandMatch</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/matching" className="px-3 py-2 text-sm text-text-secondary hover:text-foreground rounded-lg hover:bg-surface-light transition-colors">
                マッチング
              </Link>
              <Link href="/bands" className="px-3 py-2 text-sm text-text-secondary hover:text-foreground rounded-lg hover:bg-surface-light transition-colors">
                バンド
              </Link>
              <Link href="/events" className="px-3 py-2 text-sm text-text-secondary hover:text-foreground rounded-lg hover:bg-surface-light transition-colors">
                イベント
              </Link>
              <Link href="/community" className="px-3 py-2 text-sm text-text-secondary hover:text-foreground rounded-lg hover:bg-surface-light transition-colors">
                コミュニティ
              </Link>
              <Link href="/subscription" className="px-3 py-2 text-sm text-text-muted hover:text-foreground rounded-lg hover:bg-surface-light transition-colors">
                料金プラン
              </Link>
              {user.isAdmin && (
                <Link href="/admin" className="px-3 py-2 text-sm text-accent hover:text-accent-light rounded-lg hover:bg-surface-light transition-colors">
                  管理画面
                </Link>
              )}
            </nav>
            <div className="relative">
              <Link href="/dashboard" className="p-2 text-text-secondary hover:text-foreground rounded-lg hover:bg-surface-light transition-colors relative">
                <span className="text-lg">🔔</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span>
              </Link>
            </div>
            <Link href="/profile" className="flex items-center gap-2">
              <Avatar name={user.name} size="sm" online />
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              ログアウト
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">ログイン</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">新規登録</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
