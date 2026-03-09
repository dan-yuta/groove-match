'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { mockEvents, mockBands } from '@/data';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';
import { GlassCard, Card, Badge, Button } from '@/components/ui';
import { Band, LiveEvent } from '@/lib/types';

export default function EventDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showBandDropdown, setShowBandDropdown] = useState(false);

  const eventId = params.id as string;

  const allBands = useMemo(() => {
    return storage.get<Band[]>('bands') || mockBands;
  }, []);

  const allEvents = useMemo(() => {
    return storage.get<LiveEvent[]>('events') || mockEvents;
  }, []);

  const event = useMemo(() => {
    return allEvents.find((e) => e.id === eventId);
  }, [allEvents, eventId]);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-text-muted text-lg">イベントが見つかりませんでした</p>
        <Link href="/events">
          <Button variant="secondary">イベント一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  const registeredBandsList = event.registeredBands
    .map((bandId) => allBands.find((b) => b.id === bandId))
    .filter(Boolean) as Band[];

  const userBands = allBands.filter((band) =>
    band.members.some((m) => m.userId === user?.id)
  );

  const availableUserBands = userBands.filter(
    (band) => !event.registeredBands.includes(band.id)
  );

  const isEventFull = event.registeredBands.length >= event.capacity;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${date.getFullYear()}年${month}月${day}日（${dayOfWeek}）`;
  };

  const formatFee = (fee: number) => {
    return fee === 0 ? '無料' : `¥${fee.toLocaleString()}`;
  };

  const handleRegisterBand = (bandId: string) => {
    if (isEventFull) {
      showToast('このイベントは満員です', 'warning');
      return;
    }

    const updatedEvent: LiveEvent = {
      ...event,
      registeredBands: [...event.registeredBands, bandId],
    };

    const updatedEvents = allEvents.map((e) => (e.id === event.id ? updatedEvent : e));
    storage.set('events', updatedEvents);

    const registeredBand = allBands.find((b) => b.id === bandId);
    showToast(`${registeredBand?.name || 'バンド'}をイベントに登録しました！`, 'success');
    setShowBandDropdown(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1 text-text-secondary hover:text-foreground transition-colors text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        イベント一覧に戻る
      </Link>

      <GlassCard gradientBorder>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{event.title}</h1>
            <div className="flex gap-2 shrink-0">
              {event.isBeginnerFriendly && (
                <Badge variant="success">初心者歓迎</Badge>
              )}
              {isEventFull ? (
                <Badge variant="accent">満員</Badge>
              ) : (
                <Badge variant="secondary">受付中</Badge>
              )}
            </div>
          </div>

          <p className="text-text-secondary leading-relaxed">{event.description}</p>

          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <Badge key={tag} variant="primary">{tag}</Badge>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h2 className="font-semibold text-lg mb-4">イベント詳細</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted">開催日</p>
                  <p className="text-sm text-foreground font-medium">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted">時間</p>
                  <p className="text-sm text-foreground font-medium">{event.startTime} - {event.endTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted">会場</p>
                  <p className="text-sm text-foreground font-medium">{event.venue}</p>
                  <p className="text-xs text-text-muted mt-0.5">{event.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted">参加費</p>
                  <p className="text-sm text-foreground font-medium">{formatFee(event.fee)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted">定員</p>
                  <p className="text-sm text-foreground font-medium">
                    {event.registeredBands.length}/{event.capacity}バンド
                  </p>
                  <div className="w-32 h-1.5 bg-surface-lighter rounded-full mt-1.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{ width: `${Math.min((event.registeredBands.length / event.capacity) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted">初心者</p>
                  <p className="text-sm text-foreground font-medium">
                    {event.isBeginnerFriendly ? '歓迎' : '経験者向け'}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="font-semibold text-lg mb-4">
              登録バンド ({registeredBandsList.length}/{event.capacity})
            </h2>
            {registeredBandsList.length > 0 ? (
              <div className="space-y-3">
                {registeredBandsList.map((band) => (
                  <Link key={band.id} href={`/bands/${band.id}`}>
                    <Card padding="sm" hover>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{band.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {band.genre.map((g) => (
                              <Badge key={g} variant="primary" size="sm">{g}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-text-muted">{band.members.length}人</p>
                          <p className="text-xs text-text-muted">{band.prefecture}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm text-center py-4">まだバンドが登録されていません</p>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="font-semibold text-lg mb-4">バンドを登録</h2>
            {!user ? (
              <p className="text-text-muted text-sm">ログインしてバンドを登録しましょう</p>
            ) : isEventFull ? (
              <p className="text-text-muted text-sm">このイベントは定員に達しています</p>
            ) : availableUserBands.length === 0 ? (
              <div className="space-y-3">
                <p className="text-text-muted text-sm">
                  {userBands.length > 0
                    ? 'あなたの全バンドは既に登録済みです'
                    : '登録可能なバンドがありません'}
                </p>
                {userBands.length === 0 && (
                  <Link href="/bands/create">
                    <Button variant="secondary" size="sm" fullWidth>
                      バンドを作成する
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => setShowBandDropdown(!showBandDropdown)}
                  >
                    バンドを選択して登録
                    <svg className={`w-4 h-4 ml-1 transition-transform ${showBandDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  {showBandDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-surface border border-border-light shadow-xl z-10 overflow-hidden">
                      {availableUserBands.map((band) => (
                        <button
                          key={band.id}
                          onClick={() => handleRegisterBand(band.id)}
                          className="w-full text-left px-4 py-3 hover:bg-surface-light transition-colors border-b border-border-light last:border-0"
                        >
                          <p className="font-medium text-foreground text-sm">{band.name}</p>
                          <p className="text-xs text-text-muted">{band.genre.join(', ')}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h2 className="font-semibold text-lg mb-3">イベント情報</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">地域</span>
                <span className="text-foreground">{event.prefecture}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">参加費</span>
                <span className="text-foreground font-medium">{formatFee(event.fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">定員</span>
                <span className="text-foreground">{event.capacity}バンド</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">登録数</span>
                <span className="text-foreground">{event.registeredBands.length}バンド</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
