import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import ClientProviders from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto' });

export const metadata: Metadata = {
  title: 'Groove Match - やりたい曲で仲間を見つけよう',
  description: '同じ曲をコピーしたい仲間が見つかる！初心者コピバン向けマッチング＆コミュニティアプリ。',
  openGraph: {
    title: 'Groove Match - やりたい曲で仲間を見つけよう',
    description: '同じ曲をコピーしたい仲間が見つかる！初心者コピバン向けアプリ。',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Groove Match',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <body className={`${inter.variable} ${notoSansJP.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
