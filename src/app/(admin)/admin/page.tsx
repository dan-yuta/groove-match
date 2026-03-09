'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Badge } from '@/components/ui';
import { storage } from '@/lib/storage';
import { mockUsers, mockBands, mockEvents } from '@/data';
import { User } from '@/lib/types';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';

export default function AdminDashboard() {
  const users: User[] = useMemo(() => storage.get<User[]>('users') || mockUsers, []);

  const stats = useMemo(() => {
    const subBreakdown = { free: 0, basic: 0, premium: 0 };
    users.forEach((u) => { subBreakdown[u.subscription]++; });

    const revenue = subBreakdown.basic * SUBSCRIPTION_PLANS.basic.price + subBreakdown.premium * SUBSCRIPTION_PLANS.premium.price;
    const activeUsers = users.filter((u) => {
      const last = new Date(u.lastLoginAt);
      const week = new Date();
      week.setDate(week.getDate() - 7);
      return last >= week;
    }).length;

    return {
      totalUsers: users.length,
      activeUsers,
      totalBands: mockBands.length,
      totalEvents: mockEvents.length,
      monthlyRevenue: revenue,
      subBreakdown,
    };
  }, [users]);

  const statCards = [
    { label: '総ユーザー数', value: stats.totalUsers, color: 'from-primary to-primary-light', icon: '👥' },
    { label: 'アクティブユーザー', value: stats.activeUsers, color: 'from-emerald-500 to-emerald-400', icon: '✅' },
    { label: 'バンド数', value: stats.totalBands, color: 'from-secondary to-secondary-light', icon: '🎸' },
    { label: 'イベント数', value: stats.totalEvents, color: 'from-amber-500 to-amber-400', icon: '🎤' },
    { label: '月間売上', value: `¥${stats.monthlyRevenue.toLocaleString()}`, color: 'from-accent to-accent-light', icon: '💰' },
  ];

  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // Revenue chart data (mock monthly data)
  const months = ['10月', '11月', '12月', '1月', '2月', '3月'];
  const revenueData = [45000, 68000, 82000, 95000, 110000, stats.monthlyRevenue];
  const maxRevenue = Math.max(...revenueData);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">管理ダッシュボード</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard padding="sm" className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-xs text-text-muted mt-1">{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <GlassCard>
          <h3 className="font-bold mb-4">月間売上推移</h3>
          <div className="flex items-end gap-3 h-40">
            {months.map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-text-muted">¥{(revenueData[i] / 1000).toFixed(0)}K</span>
                <motion.div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary"
                  initial={{ height: 0 }}
                  animate={{ height: `${(revenueData[i] / maxRevenue) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                />
                <span className="text-xs text-text-muted">{month}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Subscription Breakdown */}
        <GlassCard>
          <h3 className="font-bold mb-4">プラン別内訳</h3>
          <div className="space-y-4">
            {(['free', 'basic', 'premium'] as const).map((plan) => {
              const count = stats.subBreakdown[plan];
              const pct = Math.round((count / stats.totalUsers) * 100);
              const colors = { free: 'bg-text-muted', basic: 'bg-primary', premium: 'bg-accent' };
              const labels = { free: 'Free', basic: 'Basic (¥980)', premium: 'Premium (¥1,980)' };
              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{labels[plan]}</span>
                    <span className="text-text-muted">{count}人 ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-surface-lighter rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${colors[plan]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border-light text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">有料ユーザー率</span>
              <span className="font-medium">{Math.round(((stats.subBreakdown.basic + stats.subBreakdown.premium) / stats.totalUsers) * 100)}%</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Users */}
      <GlassCard>
        <h3 className="font-bold mb-4">最近登録したユーザー</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs border-b border-border-light">
                <th className="text-left py-2 font-medium">名前</th>
                <th className="text-left py-2 font-medium">メール</th>
                <th className="text-left py-2 font-medium">プラン</th>
                <th className="text-left py-2 font-medium">登録日</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-border-light/50">
                  <td className="py-2.5">{u.name}</td>
                  <td className="py-2.5 text-text-muted">{u.email}</td>
                  <td className="py-2.5">
                    <Badge variant={u.subscription === 'premium' ? 'accent' : u.subscription === 'basic' ? 'primary' : 'default'} size="sm">
                      {u.subscription}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-text-muted">{new Date(u.createdAt).toLocaleDateString('ja-JP')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
