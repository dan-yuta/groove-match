import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import ClientProviders from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto' });

export const metadata: Metadata = {
  title: 'BandMatch - 初心者バンドマンのためのコミュニティ',
  description: 'バンドメンバーを見つけて、一緒にライブを目指そう！初心者歓迎のバンドマッチングアプリ。',
  openGraph: {
    title: 'BandMatch - 初心者バンドマンのためのコミュニティ',
    description: 'バンドメンバーを見つけて、一緒にライブを目指そう！',
    type: 'website',
  },
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
