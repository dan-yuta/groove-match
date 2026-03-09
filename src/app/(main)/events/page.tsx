'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockEvents } from '@/data';
import { PREFECTURES } from '@/lib/constants';
import { GlassCard, Badge, Button } from '@/components/ui';

type SortOption = 'date_asc' | 'date_desc';

export default function EventsPage() {
  const [prefectureFilter, setPrefectureFilter] = useState('');
  const [beginnerOnly, setBeginnerOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('date_asc');

  const uniquePrefectures = useMemo(() => {
    const prefSet = new Set(mockEvents.map((e) => e.prefecture));
    return PREFECTURES.filter((p) => prefSet.has(p));
  }, []);

  const filteredEvents = useMemo(() => {
    let events = mockEvents.filter((event) => {
      if (prefectureFilter && event.prefecture !== prefectureFilter) return false;
      if (beginnerOnly && !event.isBeginnerFriendly) return false;
      return true;
    });

    events.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOption === 'date_asc' ? dateA - dateB : dateB - dateA;
    });

    return events;
  }, [prefectureFilter, beginnerOnly, sortOption]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
          イベント一覧
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {filteredEvents.length}件のイベントが見つかりました
        </p>
      </div>

      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <select
            value={prefectureFilter}
            onChange={(e) => setPrefectureFilter(e.target.value)}
            className="rounded-xl bg-surface-light/50 border border-border-light text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 px-4 py-2.5 text-sm"
          >
            <option value="">全地域</option>
            {uniquePrefectures.map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="rounded-xl bg-surface-light/50 border border-border-light text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 px-4 py-2.5 text-sm"
          >
            <option value="date_asc">開催日が近い順</option>
            <option value="date_desc">開催日が遠い順</option>
          </select>

          <button
            onClick={() => setBeginnerOnly(!beginnerOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              beginnerOnly
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-surface-light/50 border border-border-light text-text-secondary hover:border-primary/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            初心者歓迎のみ
          </button>

          {(prefectureFilter || beginnerOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPrefectureFilter('');
                setBeginnerOnly(false);
              }}
            >
              クリア
            </Button>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <GlassCard
              className="h-full hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground line-clamp-2 flex-1">{event.title}</h3>
                  {event.isBeginnerFriendly && (
                    <Badge variant="success" size="sm" className="shrink-0">初心者OK</Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(event.date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-text-secondary">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>

                  <div className="flex items-center gap-2 text-text-secondary">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{event.venue} ({event.prefecture})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="primary" size="sm">{tag}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-foreground">{formatFee(event.fee)}</span>
                    <span className="text-xs text-text-muted">/バンド</span>
                  </div>
                  <div className="flex items-center gap-1 text-text-muted text-xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.registeredBands.length}/{event.capacity}バンド</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <GlassCard className="text-center py-12">
          <p className="text-text-muted text-lg mb-2">該当するイベントが見つかりませんでした</p>
          <p className="text-text-muted text-sm">フィルターを変更してお試しください</p>
        </GlassCard>
      )}
    </div>
  );
}
