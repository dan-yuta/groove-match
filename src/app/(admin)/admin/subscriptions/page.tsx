'use client';

import { useState, useMemo } from 'react';
import { GlassCard, Badge, Button, Avatar } from '@/components/ui';
import { storage } from '@/lib/storage';
import { mockUsers } from '@/data';
import { User, SubscriptionPlan } from '@/lib/types';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { useToast } from '@/components/ui/Toast';

export default function AdminSubscriptionsPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(() => storage.get<User[]>('users') || mockUsers);
  const [filterPlan, setFilterPlan] = useState<string>('');

  const paidUsers = useMemo(() => {
    let list = users.filter((u) => u.subscription !== 'free');
    if (filterPlan) {
      list = list.filter((u) => u.subscription === filterPlan);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [users, filterPlan]);

  const stats = useMemo(() => {
    const free = users.filter((u) => u.subscription === 'free').length;
    const basic = users.filter((u) => u.subscription === 'basic').length;
    const premium = users.filter((u) => u.subscription === 'premium').length;
    return { free, basic, premium, total: users.length };
  }, [users]);

  const changePlan = (userId: string, plan: SubscriptionPlan) => {
    const updated = users.map((u) => u.id === userId ? { ...u, subscription: plan } : u);
    setUsers(updated);
    storage.set('users', updated);
    showToast(`プランを${plan}に変更しました`, 'success');
  };

  // Mock billing records
  const billingRecords = paidUsers.slice(0, 10).map((u, i) => ({
    id: `bill-${i}`,
    user: u,
    amount: SUBSCRIPTION_PLANS[u.subscription].price,
    date: new Date(2026, 2, 1 + i).toISOString(),
    status: i % 8 === 0 ? 'failed' as const : 'paid' as const,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">サブスクリプション管理</h1>

      {/* Plan Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="text-center">
          <div className="text-3xl font-bold text-text-muted">{stats.free}</div>
          <div className="text-sm text-text-muted mt-1">Free</div>
          <div className="text-xs text-text-muted">¥0/月</div>
        </GlassCard>
        <GlassCard className="text-center border-primary/30">
          <div className="text-3xl font-bold text-primary-light">{stats.basic}</div>
          <div className="text-sm text-text-muted mt-1">Basic</div>
          <div className="text-xs text-primary-light">¥{(stats.basic * 980).toLocaleString()}/月</div>
        </GlassCard>
        <GlassCard className="text-center border-accent/30">
          <div className="text-3xl font-bold text-accent">{stats.premium}</div>
          <div className="text-sm text-text-muted mt-1">Premium</div>
          <div className="text-xs text-accent">¥{(stats.premium * 1980).toLocaleString()}/月</div>
        </GlassCard>
      </div>

      {/* Conversion Funnel */}
      <GlassCard>
        <h3 className="font-bold mb-4">コンバージョン率</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Free → Basic</span>
              <span className="text-text-muted">{Math.round((stats.basic / Math.max(stats.total, 1)) * 100)}%</span>
            </div>
            <div className="h-3 bg-surface-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(stats.basic / Math.max(stats.total, 1)) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Basic → Premium</span>
              <span className="text-text-muted">{stats.basic > 0 ? Math.round((stats.premium / (stats.basic + stats.premium)) * 100) : 0}%</span>
            </div>
            <div className="h-3 bg-surface-lighter rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${stats.basic > 0 ? (stats.premium / (stats.basic + stats.premium)) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Paid Users Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">有料ユーザー</h3>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="rounded-lg bg-surface-light border border-border-light text-xs px-3 py-1.5 text-foreground"
          >
            <option value="">全プラン</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs border-b border-border-light">
                <th className="text-left py-2 font-medium">ユーザー</th>
                <th className="text-left py-2 font-medium">プラン</th>
                <th className="text-right py-2 font-medium">月額</th>
                <th className="text-left py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {paidUsers.map((user) => (
                <tr key={user.id} className="border-b border-border-light/50">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-text-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <Badge variant={user.subscription === 'premium' ? 'accent' : 'primary'} size="sm">
                      {user.subscription}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right">¥{SUBSCRIPTION_PLANS[user.subscription].price.toLocaleString()}</td>
                  <td className="py-2.5">
                    <div className="flex gap-1">
                      {user.subscription !== 'premium' && (
                        <Button variant="ghost" size="sm" onClick={() => changePlan(user.id, 'premium')}>
                          Premium化
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => changePlan(user.id, 'free')}>
                        解約
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Recent Billing */}
      <GlassCard>
        <h3 className="font-bold mb-4">最近の請求</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs border-b border-border-light">
                <th className="text-left py-2 font-medium">ユーザー</th>
                <th className="text-left py-2 font-medium">プラン</th>
                <th className="text-right py-2 font-medium">金額</th>
                <th className="text-left py-2 font-medium">日付</th>
                <th className="text-left py-2 font-medium">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {billingRecords.map((record) => (
                <tr key={record.id} className="border-b border-border-light/50">
                  <td className="py-2.5">{record.user.name}</td>
                  <td className="py-2.5">
                    <Badge variant={record.user.subscription === 'premium' ? 'accent' : 'primary'} size="sm">
                      {record.user.subscription}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right">¥{record.amount.toLocaleString()}</td>
                  <td className="py-2.5 text-text-muted">{new Date(record.date).toLocaleDateString('ja-JP')}</td>
                  <td className="py-2.5">
                    <Badge variant={record.status === 'paid' ? 'success' : 'warning'} size="sm">
                      {record.status === 'paid' ? '支払済' : '失敗'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
