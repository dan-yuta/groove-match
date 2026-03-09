'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockBands, mockUsers } from '@/data';
import { INSTRUMENTS, GENRES, PREFECTURES } from '@/lib/constants';
import { GlassCard, Badge, Button, Avatar } from '@/components/ui';

export default function BandsPage() {
  const [genreFilter, setGenreFilter] = useState('');
  const [prefectureFilter, setPrefectureFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBands = useMemo(() => {
    return mockBands.filter((band) => {
      if (genreFilter && !band.genre.includes(genreFilter)) return false;
      if (prefectureFilter && band.prefecture !== prefectureFilter) return false;
      if (searchQuery && !band.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [genreFilter, prefectureFilter, searchQuery]);

  const getInstrumentLabel = (instrumentId: string) => {
    return INSTRUMENTS.find((i) => i.id === instrumentId)?.label || instrumentId;
  };

  const getInstrumentIcon = (instrumentId: string) => {
    return INSTRUMENTS.find((i) => i.id === instrumentId)?.icon || '🎵';
  };

  const getUserById = (userId: string) => {
    return mockUsers.find((u) => u.id === userId);
  };

  const uniquePrefectures = useMemo(() => {
    const prefSet = new Set(mockBands.map((b) => b.prefecture));
    return PREFECTURES.filter((p) => prefSet.has(p));
  }, []);

  const uniqueGenres = useMemo(() => {
    const genreSet = new Set(mockBands.flatMap((b) => b.genre));
    return GENRES.filter((g) => genreSet.has(g));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
            バンド一覧
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {filteredBands.length}件のバンドが見つかりました
          </p>
        </div>
        <Link href="/bands/create">
          <Button size="md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            バンドを作成
          </Button>
        </Link>
      </div>

      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="バンド名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-surface-light/50 border border-border-light text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 pl-4 pr-4 py-2.5 text-sm"
            />
          </div>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="rounded-xl bg-surface-light/50 border border-border-light text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 px-4 py-2.5 text-sm"
          >
            <option value="">全ジャンル</option>
            {uniqueGenres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
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
          {(genreFilter || prefectureFilter || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGenreFilter('');
                setPrefectureFilter('');
                setSearchQuery('');
              }}
            >
              クリア
            </Button>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBands.map((band) => {
          const filledSlots = band.instrumentSlots.filter((s) => s.filled).length;
          const totalSlots = band.instrumentSlots.length;

          return (
            <Link key={band.id} href={`/bands/${band.id}`}>
              <GlassCard
                className="h-full hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                gradientBorder={band.isRecruiting}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-foreground truncate">{band.name}</h3>
                      <p className="text-text-muted text-xs mt-0.5">
                        {band.prefecture} {band.city}
                      </p>
                    </div>
                    {band.isRecruiting ? (
                      <Badge variant="success" size="sm">募集中</Badge>
                    ) : (
                      <Badge variant="default" size="sm">募集停止</Badge>
                    )}
                  </div>

                  <p className="text-text-secondary text-sm line-clamp-2">{band.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {band.genre.map((g) => (
                      <Badge key={g} variant="primary" size="sm">{g}</Badge>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs text-text-muted mb-2">
                      楽器スロット ({filledSlots}/{totalSlots})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {band.instrumentSlots.map((slot, idx) => {
                        const member = slot.userId ? getUserById(slot.userId) : null;
                        return (
                          <div
                            key={`${slot.instrument}-${idx}`}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${
                              slot.filled
                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                                : 'bg-transparent border border-dashed border-text-muted/30 text-text-muted'
                            }`}
                          >
                            <span>{getInstrumentIcon(slot.instrument)}</span>
                            <span>{getInstrumentLabel(slot.instrument)}</span>
                            {slot.filled && member && (
                              <Avatar name={member.name} size="sm" className="ml-0.5 scale-75 -my-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-light">
                    <div className="flex -space-x-2">
                      {band.members.slice(0, 4).map((m) => {
                        const memberUser = getUserById(m.userId);
                        return (
                          <Avatar
                            key={m.userId}
                            name={memberUser?.name || 'Unknown'}
                            size="sm"
                          />
                        );
                      })}
                      {band.members.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-surface-lighter flex items-center justify-center text-xs text-text-muted border-2 border-surface">
                          +{band.members.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">
                      {band.members.length}/{band.maxMembers}人
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>

      {filteredBands.length === 0 && (
        <GlassCard className="text-center py-12">
          <p className="text-text-muted text-lg mb-2">該当するバンドが見つかりませんでした</p>
          <p className="text-text-muted text-sm">フィルターを変更してお試しください</p>
        </GlassCard>
      )}
    </div>
  );
}
