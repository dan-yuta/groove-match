'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { findMatches } from '@/lib/matching';
import { storage } from '@/lib/storage';
import { INSTRUMENTS, GENRES, PREFECTURES, SKILL_LEVELS } from '@/lib/constants';
import { User, MatchResult } from '@/lib/types';
import { GlassCard, Card, Badge, Button, Avatar, Input } from '@/components/ui';
import { mockUsers } from '@/data';

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-text-muted">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-lighter rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-text-muted">{value}</span>
    </div>
  );
}

export default function MatchingPage() {
  const { user } = useAuth();
  const [filterGenre, setFilterGenre] = useState('');
  const [filterInstrument, setFilterInstrument] = useState('');
  const [filterPrefecture, setFilterPrefecture] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const allUsers: User[] = useMemo(() => {
    return storage.get<User[]>('users') || mockUsers;
  }, []);

  const matches: MatchResult[] = useMemo(() => {
    if (!user) return [];
    let results = findMatches(user, allUsers);

    if (filterGenre) {
      results = results.filter((r) => r.user.genres.includes(filterGenre));
    }
    if (filterInstrument) {
      results = results.filter((r) => r.user.instruments.some((i) => i.instrument === filterInstrument));
    }
    if (filterPrefecture) {
      results = results.filter((r) => r.user.prefecture === filterPrefecture);
    }
    if (filterSkill) {
      results = results.filter((r) => r.user.instruments.some((i) => i.skillLevel === filterSkill));
    }
    return results;
  }, [user, allUsers, filterGenre, filterInstrument, filterPrefecture, filterSkill]);

  const getInstrumentLabel = (id: string) => INSTRUMENTS.find((i) => i.id === id)?.label || id;
  const getInstrumentIcon = (id: string) => INSTRUMENTS.find((i) => i.id === id)?.icon || '🎵';
  const getSkillLabel = (id: string) => SKILL_LEVELS.find((s) => s.id === id)?.label || id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">マッチング</h1>
          <p className="text-text-muted text-sm mt-1">あなたにぴったりのメンバーを見つけよう</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? 'フィルターを閉じる' : 'フィルター'}
        </Button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
          <GlassCard>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">ジャンル</label>
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="w-full rounded-lg bg-surface-light border border-border-light text-sm px-3 py-2 text-foreground"
                >
                  <option value="">すべて</option>
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">楽器</label>
                <select
                  value={filterInstrument}
                  onChange={(e) => setFilterInstrument(e.target.value)}
                  className="w-full rounded-lg bg-surface-light border border-border-light text-sm px-3 py-2 text-foreground"
                >
                  <option value="">すべて</option>
                  {INSTRUMENTS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">地域</label>
                <select
                  value={filterPrefecture}
                  onChange={(e) => setFilterPrefecture(e.target.value)}
                  className="w-full rounded-lg bg-surface-light border border-border-light text-sm px-3 py-2 text-foreground"
                >
                  <option value="">すべて</option>
                  {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">スキルレベル</label>
                <select
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                  className="w-full rounded-lg bg-surface-light border border-border-light text-sm px-3 py-2 text-foreground"
                >
                  <option value="">すべて</option>
                  {SKILL_LEVELS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="text-sm text-text-muted">{matches.length} 人のメンバーが見つかりました</div>

      <div className="grid gap-4">
        {matches.map((match, i) => (
          <motion.div
            key={match.user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="hover:border-primary/30 transition-all duration-300">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar name={match.user.name} size="lg" online={match.user.isOnline} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold">{match.user.name}</h3>
                      <span className="text-sm text-text-muted">@{match.user.nickname}</span>
                      {match.user.subscription === 'premium' && (
                        <Badge variant="accent" size="sm">Premium</Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-muted mt-1">{match.user.prefecture} {match.user.city}</p>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{match.user.bio}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {match.user.instruments.map((inst) => (
                        <Badge key={inst.instrument} variant="primary" size="sm">
                          {getInstrumentIcon(inst.instrument)} {getInstrumentLabel(inst.instrument)} ({getSkillLabel(inst.skillLevel)})
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {match.user.genres.map((g) => (
                        <Badge key={g} variant="secondary" size="sm">{g}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sm:w-48 flex-shrink-0">
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold gradient-text">{match.score}</div>
                    <div className="text-xs text-text-muted">相性スコア</div>
                  </div>
                  <div className="space-y-1.5">
                    <ScoreBar label="地域" value={match.breakdown.area} max={50} color="bg-emerald-500" />
                    <ScoreBar label="楽器" value={match.breakdown.instrument} max={25} color="bg-primary" />
                    <ScoreBar label="ジャンル" value={match.breakdown.genre} max={30} color="bg-secondary" />
                    <ScoreBar label="スキル" value={match.breakdown.skill} max={15} color="bg-amber-500" />
                    <ScoreBar label="スケジュール" value={match.breakdown.schedule} max={35} color="bg-accent" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
