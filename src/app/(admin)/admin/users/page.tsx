'use client';

import { useState, useMemo } from 'react';
import { GlassCard, Badge, Button, Input, Avatar, Modal } from '@/components/ui';
import { storage } from '@/lib/storage';
import { mockUsers } from '@/data';
import { User, SubscriptionPlan } from '@/lib/types';
import { INSTRUMENTS } from '@/lib/constants';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(() => storage.get<User[]>('users') || mockUsers);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.nickname.toLowerCase().includes(q));
    }
    if (filterPlan) {
      list = list.filter((u) => u.subscription === filterPlan);
    }
    return list;
  }, [users, search, filterPlan]);

  const getInstrumentLabel = (id: string) => INSTRUMENTS.find((i) => i.id === id)?.label || id;

  const changePlan = (userId: string, plan: SubscriptionPlan) => {
    const updated = users.map((u) => u.id === userId ? { ...u, subscription: plan } : u);
    setUsers(updated);
    storage.set('users', updated);
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, subscription: plan });
    }
    showToast('プランを変更しました', 'success');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ユーザー管理</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="名前・メール・ニックネームで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="rounded-xl bg-surface-light border border-border-light text-sm px-4 py-2.5 text-foreground"
        >
          <option value="">全プラン</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div className="text-sm text-text-muted">{filtered.length} 件のユーザー</div>

      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs border-b border-border-light">
                <th className="text-left p-4 font-medium">ユーザー</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">メール</th>
                <th className="text-left p-4 font-medium">楽器</th>
                <th className="text-left p-4 font-medium">プラン</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">最終ログイン</th>
                <th className="text-left p-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border-light/50 hover:bg-surface-light/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" online={user.isOnline} />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-text-muted">@{user.nickname}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-text-muted hidden sm:table-cell">{user.email}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {user.instruments.slice(0, 2).map((inst) => (
                        <Badge key={inst.instrument} variant="primary" size="sm">
                          {getInstrumentLabel(inst.instrument)}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={user.subscription === 'premium' ? 'accent' : user.subscription === 'basic' ? 'primary' : 'default'}
                      size="sm"
                    >
                      {user.subscription}
                    </Badge>
                  </td>
                  <td className="p-4 text-text-muted text-xs hidden md:table-cell">
                    {new Date(user.lastLoginAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                      詳細
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* User Detail Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="ユーザー詳細" size="lg">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedUser.name} size="lg" online={selectedUser.isOnline} />
              <div>
                <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                <p className="text-sm text-text-muted">@{selectedUser.nickname}</p>
                <p className="text-sm text-text-muted">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">地域:</span>
                <span className="ml-2">{selectedUser.prefecture} {selectedUser.city}</span>
              </div>
              <div>
                <span className="text-text-muted">登録日:</span>
                <span className="ml-2">{new Date(selectedUser.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
              <div>
                <span className="text-text-muted">権限:</span>
                <span className="ml-2">{selectedUser.isAdmin ? '管理者' : '一般'}</span>
              </div>
              <div>
                <span className="text-text-muted">ステータス:</span>
                <span className={`ml-2 ${selectedUser.isOnline ? 'text-emerald-400' : 'text-text-muted'}`}>
                  {selectedUser.isOnline ? 'オンライン' : 'オフライン'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-sm text-text-muted">自己紹介:</span>
              <p className="text-sm mt-1">{selectedUser.bio || '未設定'}</p>
            </div>

            <div>
              <span className="text-sm text-text-muted block mb-2">楽器:</span>
              <div className="flex flex-wrap gap-2">
                {selectedUser.instruments.map((inst) => (
                  <Badge key={inst.instrument} variant="primary">
                    {getInstrumentLabel(inst.instrument)} ({inst.skillLevel})
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm text-text-muted block mb-2">プラン変更:</span>
              <div className="flex gap-2">
                {(['free', 'basic', 'premium'] as const).map((plan) => (
                  <Button
                    key={plan}
                    variant={selectedUser.subscription === plan ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => changePlan(selectedUser.id, plan)}
                  >
                    {plan}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
