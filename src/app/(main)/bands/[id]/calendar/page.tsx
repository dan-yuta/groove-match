'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { mockBands, mockUsers } from '@/data';
import { mockSchedules } from '@/data/mockSchedules';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';
import { GlassCard, Badge, Button, Avatar, Input } from '@/components/ui';
import {
  Band,
  PracticeSchedule,
  ScheduleStatus,
  ScheduleResponse,
} from '@/lib/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  ScheduleStatus,
  { label: string; dotColor: string; badgeBg: string; badgeText: string }
> = {
  proposed: {
    label: '提案中',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-400',
  },
  confirmed: {
    label: '確定',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-400',
  },
  completed: {
    label: '完了',
    dotColor: 'bg-gray-400',
    badgeBg: 'bg-gray-500/20',
    badgeText: 'text-gray-400',
  },
  cancelled: {
    label: 'キャンセル',
    dotColor: 'bg-red-400',
    badgeBg: 'bg-red-500/20',
    badgeText: 'text-red-400',
  },
};

const RESPONSE_CONFIG: Record<
  ScheduleResponse,
  { label: string; variant: 'success' | 'accent' | 'default' }
> = {
  ok: { label: 'OK', variant: 'success' },
  ng: { label: 'NG', variant: 'accent' },
  pending: { label: '未回答', variant: 'default' },
};

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function dateKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function todayKey() {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BandCalendarPage() {
  const params = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const bandId = params.id as string;

  // ---- state ----
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() }; // 0-indexed
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    studioName: '',
    studioAddress: '',
    note: '',
  });

  // ---- data ----
  const allBands = useMemo(() => {
    return storage.get<Band[]>('bands') || mockBands;
  }, []);

  const band = useMemo(() => {
    return allBands.find((b) => b.id === bandId);
  }, [allBands, bandId]);

  const schedules = useMemo(() => {
    const stored = storage.get<PracticeSchedule[]>('practiceSchedules');
    const base = stored && stored.length > 0 ? stored : mockSchedules;
    return base.filter((s) => s.bandId === bandId);
  }, [bandId]);

  // Map date string -> schedules for quick lookup
  const schedulesByDate = useMemo(() => {
    const map: Record<string, PracticeSchedule[]> = {};
    for (const s of schedules) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    return map;
  }, [schedules]);

  // Schedules for the current month
  const monthSchedules = useMemo(() => {
    const prefix = `${currentMonth.year}-${pad(currentMonth.month + 1)}`;
    return schedules.filter((s) => s.date.startsWith(prefix));
  }, [schedules, currentMonth]);

  // Filtered list: selected date or full month
  const displaySchedules = useMemo(() => {
    if (selectedDate && schedulesByDate[selectedDate]) {
      return schedulesByDate[selectedDate];
    }
    return monthSchedules;
  }, [selectedDate, schedulesByDate, monthSchedules]);

  // ---- calendar grid ----
  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    // Convert to Mon=0 ... Sun=6
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // Fill trailing empty
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentMonth]);

  // ---- membership checks ----
  const isMember = useMemo(() => {
    if (!user || !band) return false;
    return band.members.some((m) => m.userId === user.id);
  }, [user, band]);

  const isLeader = useMemo(() => {
    if (!user || !band) return false;
    return band.members.some((m) => m.userId === user.id && m.role === 'leader');
  }, [user, band]);

  const isPro = user?.subscription === 'pro';

  // ---- helpers ----
  const getUserById = useCallback(
    (userId: string) => mockUsers.find((u) => u.id === userId),
    [],
  );

  // ---- actions ----
  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const key = dateKey(currentMonth.year, currentMonth.month, day);
    setSelectedDate((prev) => (prev === key ? null : key));
  };

  const handleRespond = (scheduleId: string, response: 'ok' | 'ng') => {
    if (!user) return;
    const stored = storage.get<PracticeSchedule[]>('practiceSchedules') || [...mockSchedules];
    const idx = stored.findIndex((s) => s.id === scheduleId);
    if (idx === -1) return;
    const schedule = { ...stored[idx] };
    const responses = [...schedule.responses];
    const rIdx = responses.findIndex((r) => r.userId === user.id);
    const entry = { userId: user.id, response: response as ScheduleResponse, respondedAt: new Date().toISOString() };
    if (rIdx >= 0) {
      responses[rIdx] = entry;
    } else {
      responses.push(entry);
    }
    schedule.responses = responses;
    stored[idx] = schedule;
    storage.set('practiceSchedules', stored);
    showToast(response === 'ok' ? '参加で回答しました' : '不参加で回答しました', 'success');
    // Force re-render by setting state
    window.location.reload();
  };

  const handleConfirm = (scheduleId: string) => {
    const stored = storage.get<PracticeSchedule[]>('practiceSchedules') || [...mockSchedules];
    const idx = stored.findIndex((s) => s.id === scheduleId);
    if (idx === -1) return;
    stored[idx] = { ...stored[idx], status: 'confirmed' };
    storage.set('practiceSchedules', stored);
    showToast('練習を確定しました', 'success');
    window.location.reload();
  };

  const handleSubmitProposal = () => {
    if (!user || !formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      showToast('タイトル・日付・時間は必須です', 'error');
      return;
    }
    const stored = storage.get<PracticeSchedule[]>('practiceSchedules') || [...mockSchedules];
    const newSchedule: PracticeSchedule = {
      id: `schedule-${Date.now()}`,
      bandId,
      proposedBy: user.id,
      title: formData.title,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      studioName: formData.studioName || undefined,
      studioAddress: formData.studioAddress || undefined,
      note: formData.note || undefined,
      status: 'proposed',
      responses: [
        { userId: user.id, response: 'ok', respondedAt: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
    };
    stored.push(newSchedule);
    storage.set('practiceSchedules', stored);
    setFormData({ title: '', date: '', startTime: '', endTime: '', studioName: '', studioAddress: '', note: '' });
    setShowForm(false);
    showToast('練習を提案しました', 'success');
    window.location.reload();
  };

  // ---- guards ----
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

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-text-muted text-lg">練習カレンダーはProプラン限定機能です</p>
        <Link href={`/bands/${bandId}`}>
          <Button variant="secondary">バンド詳細に戻る</Button>
        </Link>
      </div>
    );
  }

  const today = todayKey();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-3xl mx-auto space-y-6 pb-20"
    >
      {/* ---- Header ---- */}
      <div>
        <Link
          href={`/bands/${bandId}`}
          className="text-sm text-primary-light hover:underline inline-flex items-center gap-1 mb-3"
        >
          <span>&larr;</span> バンド詳細に戻る
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">
          {band.name} 練習カレンダー
        </h1>
      </div>

      {/* ---- Month Calendar ---- */}
      <GlassCard>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-light transition-colors"
          >
            &lt;
          </button>
          <span className="text-lg font-semibold text-foreground">
            {currentMonth.year}年{currentMonth.month + 1}月
          </span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-light transition-colors"
          >
            &gt;
          </button>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-text-muted py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }
            const key = dateKey(currentMonth.year, currentMonth.month, day);
            const daySchedules = schedulesByDate[key] || [];
            const isToday = key === today;
            const isSelected = key === selectedDate;

            return (
              <button
                key={key}
                onClick={() => handleDateClick(day)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm transition-all duration-150
                  ${isToday ? 'ring-2 ring-primary' : ''}
                  ${isSelected ? 'bg-primary/20 text-foreground' : 'hover:bg-surface-light text-text-secondary hover:text-foreground'}
                `}
              >
                <span className={isToday ? 'font-bold text-primary-light' : ''}>
                  {day}
                </span>
                {daySchedules.length > 0 && (
                  <div className="flex gap-0.5">
                    {daySchedules.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s.status].dotColor}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* ---- Propose button ---- */}
      {isMember && (
        <div className="flex justify-end">
          <Button
            variant={showForm ? 'ghost' : 'primary'}
            size="sm"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? 'キャンセル' : '練習を提案'}
          </Button>
        </div>
      )}

      {/* ---- Proposal form ---- */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <GlassCard className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                練習を提案する
              </h3>
              <Input
                label="タイトル"
                placeholder="例: 天体観測 練習"
                value={formData.title}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, title: e.target.value }))
                }
              />
              <Input
                label="日付"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, date: e.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="開始時間"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, startTime: e.target.value }))
                  }
                />
                <Input
                  label="終了時間"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, endTime: e.target.value }))
                  }
                />
              </div>
              <Input
                label="スタジオ名"
                placeholder="例: スタジオペンタ新宿（任意）"
                value={formData.studioName}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, studioName: e.target.value }))
                }
              />
              <Input
                label="スタジオ住所"
                placeholder="例: 東京都新宿区歌舞伎町2-46-3（任意）"
                value={formData.studioAddress}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, studioAddress: e.target.value }))
                }
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  メモ
                </label>
                <textarea
                  rows={3}
                  placeholder="練習の詳細など（任意）"
                  className="w-full rounded-xl bg-surface-light/50 border border-border-light text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 px-4 py-2.5 text-sm resize-none"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, note: e.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  キャンセル
                </Button>
                <Button size="sm" onClick={handleSubmitProposal}>
                  提案する
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Schedule List ---- */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          練習スケジュール
          {selectedDate && (
            <span className="ml-2 text-sm font-normal text-text-muted">
              ({selectedDate})
            </span>
          )}
        </h2>

        {displaySchedules.length === 0 ? (
          <GlassCard>
            <p className="text-center text-text-muted py-4">
              {selectedDate
                ? 'この日のスケジュールはありません'
                : '今月のスケジュールはありません'}
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {displaySchedules.map((schedule) => {
              const cfg = STATUS_CONFIG[schedule.status];
              const proposer = getUserById(schedule.proposedBy);
              const userResponse = user
                ? schedule.responses.find((r) => r.userId === user.id)
                : undefined;
              const hasResponded =
                userResponse && userResponse.response !== 'pending';

              return (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard className="space-y-3">
                    {/* Title + status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {schedule.title}
                      </h3>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badgeBg} ${cfg.badgeText}`}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    {/* Date / time / studio */}
                    <div className="space-y-1 text-sm text-text-secondary">
                      <p>
                        {schedule.date} {schedule.startTime} - {schedule.endTime}
                      </p>
                      {schedule.studioName && (
                        <p>
                          {schedule.studioName}
                          {schedule.studioAddress && (
                            <span className="text-text-muted ml-1">
                              ({schedule.studioAddress})
                            </span>
                          )}
                        </p>
                      )}
                      {proposer && (
                        <p className="text-text-muted text-xs">
                          提案者: {proposer.nickname || proposer.name}
                        </p>
                      )}
                    </div>

                    {/* Note */}
                    {schedule.note && (
                      <p className="text-sm text-text-muted bg-surface-light/40 rounded-lg px-3 py-2">
                        {schedule.note}
                      </p>
                    )}

                    {/* Member responses */}
                    <div className="flex flex-wrap gap-2">
                      {schedule.responses.map((r) => {
                        const member = getUserById(r.userId);
                        if (!member) return null;
                        const rc = RESPONSE_CONFIG[r.response];
                        return (
                          <div
                            key={r.userId}
                            className="flex items-center gap-1.5"
                          >
                            <Avatar
                              name={member.nickname || member.name}
                              src={member.avatar}
                              size="sm"
                            />
                            <Badge variant={rc.variant} size="sm">
                              {rc.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action buttons */}
                    {schedule.status === 'proposed' && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {/* Leader can confirm */}
                        {isLeader && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(schedule.id)}
                          >
                            確定
                          </Button>
                        )}
                        {/* Member who hasn't responded */}
                        {isMember && !hasResponded && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRespond(schedule.id, 'ok')}
                            >
                              OK
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRespond(schedule.id, 'ng')}
                            >
                              NG
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
