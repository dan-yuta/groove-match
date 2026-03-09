'use client';

import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/Toast';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
