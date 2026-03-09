'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockBands, mockUsers } from '@/data';
import { INSTRUMENTS } from '@/lib/constants';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';
import { GlassCard, Card, Badge, Button, Avatar } from '@/components/ui';
import { Band } from '@/lib/types';

export default function BandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const bandId = params.id as string;

  const allBands = useMemo(() => {
    return storage.get<Band[]>('bands') || mockBands;
  }, []);

  const band = useMemo(() => {
    return allBands.find((b) => b.id === bandId);
  }, [allBands, bandId]);

  if (!band) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-text-muted text-lg">バンドが見つかりませんでした</p>
        <Link href="/bands">
          <Button variant="secondary">バンド一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  const getInstrumentLabel = (instrumentId: string) => {
    return INSTRUMENTS.find((i) => i.id === instrumentId)?.label || instrumentId;
  };

  const getInstrumentIcon = (instrumentId: string) => {
    return INSTRUMENTS.find((i) => i.id === instrumentId)?.icon || '🎵';
  };

  const getUserById = (userId: string) => {
    return mockUsers.find((u) => u.id === userId);
  };

  const isCurrentUserMember = band.members.some((m) => m.userId === user?.id);
  const leader = band.members.find((m) => m.role === 'leader');
  const leaderUser = leader ? getUserById(leader.userId) : null;

  const handleJoinBand = (slotIndex: number) => {
    if (!user) return;
    const slot = band.instrumentSlots[slotIndex];
    if (slot.filled) return;

    const updatedSlots = band.instrumentSlots.map((s, i) =>
      i === slotIndex ? { ...s, filled: true, userId: user.id } : s
    );

    const updatedBand: Band = {
      ...band,
      instrumentSlots: updatedSlots,
      members: [
        ...band.members,
        {
          userId: user.id,
          instrument: slot.instrument,
          role: 'member',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    const updatedBands = allBands.map((b) => (b.id === band.id ? updatedBand : b));
    storage.set('bands', updatedBands);

    showToast(`${band.name}に参加しました！`, 'success');
    setSelectedSlotIndex(null);
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/bands" className="inline-flex items-center gap-1 text-text-secondary hover:text-foreground transition-colors text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        バンド一覧に戻る
      </Link>

      <GlassCard gradientBorder>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{band.name}</h1>
                {band.isRecruiting ? (
                  <Badge variant="success">募集中</Badge>
                ) : (
                  <Badge variant="default">募集停止</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-text-secondary text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {band.prefecture} {band.city}
              </div>
            </div>
            {!isCurrentUserMember && band.isRecruiting && (
              <Badge variant="accent" size="md">メンバー募集中</Badge>
            )}
            {isCurrentUserMember && (
              <Badge variant="secondary" size="md">参加中</Badge>
            )}
          </div>

          <p className="text-text-secondary leading-relaxed">{band.description}</p>

          <div className="flex flex-wrap gap-2">
            {band.genre.map((g) => (
              <Badge key={g} variant="primary">{g}</Badge>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h2 className="font-semibold text-lg mb-4">メンバー ({band.members.length}/{band.maxMembers})</h2>
            <div className="space-y-3">
              {band.members.map((member) => {
                const memberUser = getUserById(member.userId);
                if (!memberUser) return null;
                return (
                  <Card key={member.userId} padding="sm" hover>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={memberUser.name}
                        size="md"
                        online={memberUser.isOnline}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{memberUser.nickname || memberUser.name}</p>
                          {member.role === 'leader' && (
                            <Badge variant="warning" size="sm">リーダー</Badge>
                          )}
                        </div>
                        <p className="text-text-muted text-xs">
                          {getInstrumentIcon(member.instrument)} {getInstrumentLabel(member.instrument)}
                        </p>
                      </div>
                      <p className="text-text-muted text-xs">
                        {new Date(member.joinedAt).toLocaleDateString('ja-JP')}加入
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="font-semibold text-lg mb-4">楽器スロット</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {band.instrumentSlots.map((slot, idx) => {
                const slotUser = slot.userId ? getUserById(slot.userId) : null;
                const canJoin = !isCurrentUserMember && !slot.filled && band.isRecruiting && user;

                return (
                  <div
                    key={`${slot.instrument}-${idx}`}
                    className={`relative rounded-xl p-4 transition-all duration-200 ${
                      slot.filled
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-transparent border-2 border-dashed border-text-muted/20'
                    } ${canJoin ? 'hover:border-primary/50 cursor-pointer' : ''}`}
                    onClick={() => canJoin && setSelectedSlotIndex(idx)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getInstrumentIcon(slot.instrument)}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {getInstrumentLabel(slot.instrument)}
                        </p>
                        {slot.filled && slotUser ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Avatar name={slotUser.name} size="sm" />
                            <span className="text-xs text-text-secondary">{slotUser.nickname || slotUser.name}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted mt-1">空きスロット</p>
                        )}
                      </div>
                      {slot.filled ? (
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-text-muted/30" />
                      )}
                    </div>

                    {canJoin && selectedSlotIndex === idx && (
                      <div className="mt-3 pt-3 border-t border-border-light">
                        <Button
                          size="sm"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinBand(idx);
                          }}
                        >
                          このパートで参加する
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="font-semibold text-lg mb-4">バンド情報</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-muted">リーダー</p>
                {leaderUser && (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar name={leaderUser.name} size="sm" />
                    <span className="text-sm text-foreground">{leaderUser.nickname || leaderUser.name}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-text-muted">活動エリア</p>
                <p className="text-sm text-foreground mt-1">{band.prefecture} {band.city}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">メンバー数</p>
                <p className="text-sm text-foreground mt-1">{band.members.length}/{band.maxMembers}人</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">結成日</p>
                <p className="text-sm text-foreground mt-1">
                  {new Date(band.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">ジャンル</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {band.genre.map((g) => (
                    <Badge key={g} variant="primary" size="sm">{g}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="font-semibold text-lg mb-4">募集パート</h2>
            {band.instrumentSlots.filter((s) => !s.filled).length > 0 ? (
              <div className="space-y-2">
                {band.instrumentSlots
                  .filter((s) => !s.filled)
                  .map((slot, idx) => (
                    <div
                      key={`empty-${slot.instrument}-${idx}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-light/50"
                    >
                      <span>{getInstrumentIcon(slot.instrument)}</span>
                      <span className="text-sm text-foreground">{getInstrumentLabel(slot.instrument)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">現在募集中のパートはありません</p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
