'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, GlassCard } from '@/components/ui';
import { Header, Footer } from '@/components/layout';

const features = [
  {
    icon: '🎯',
    title: '仲間を見つける',
    description: 'やりたい曲・弾ける曲から、同じ曲をやりたい仲間を見つけます。曲ベースマッチングで最適な仲間と出会える。',
  },
  {
    icon: '🎸',
    title: 'コピバンを組む',
    description: 'コピーするアーティスト・曲を決めてバンド結成。セットリスト管理やメンバー募集もかんたん。',
  },
  {
    icon: '🎤',
    title: 'ライブに出る',
    description: 'コピバンイベントを探してエントリー。初心者OKのイベントも多数。ステージに立とう!',
  },
  {
    icon: '💪',
    title: '挫折しない仕組み',
    description: '練習トラッカー・ストリーク・コミュニティで、ライブ本番まで楽しく続けられる。',
  },
];

const stats = [
  { value: '1,200+', label: '登録ユーザー' },
  { value: '350+', label: 'コピバン結成' },
  { value: '80+', label: 'コピバンイベント' },
  { value: '95%', label: '満足度' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
              <span className="gradient-text">やりたい曲で仲間を見つけて</span>
              <br />
              コピバンを組んで、ライブに出よう。
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
              Groove Matchは「コピバンを組んでライブに出る」を実現するアプリ。
              曲ベースマッチングで仲間を見つけて、ステージに立とう。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg">無料で始める</Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">ログイン</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Groove Matchの特徴</h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              コピバン活動に必要な機能を、すべて揃えました。
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="h-full hover:border-primary/30 transition-all duration-300">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">使い方はかんたん</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: '仲間を見つける', desc: 'やりたい曲で検索して、同じ曲をやりたい仲間とマッチング' },
              { step: '02', title: 'コピバンを結成', desc: 'メンバーを集めてバンド結成。セットリストを決めて練習開始' },
              { step: '03', title: 'ライブに出る!', desc: 'イベントにエントリーしてステージデビュー。初心者OKも多数' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">今すぐ始めよう</h2>
          <p className="text-text-secondary mb-8">
            無料プランで今すぐスタート。同じ曲をやりたいコピバン仲間がここにいます。
          </p>
          <Link href="/register">
            <Button size="lg">無料で登録する</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
