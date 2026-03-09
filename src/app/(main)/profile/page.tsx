'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { GlassCard, Card, Badge, Button, Input, Avatar } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { INSTRUMENTS, SKILL_LEVELS, GENRES, PREFECTURES, DAYS_OF_WEEK } from '@/lib/constants';
import type { UserInstrument, Schedule, SkillLevel, DayOfWeek } from '@/lib/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function getInstrumentLabel(id: string): string {
  return INSTRUMENTS.find((i) => i.id === id)?.label ?? id;
}

function getInstrumentIcon(id: string): string {
  return INSTRUMENTS.find((i) => i.id === id)?.icon ?? '';
}

function getSkillLabel(level: SkillLevel): string {
  return SKILL_LEVELS.find((s) => s.id === level)?.label ?? level;
}

function getDayLabel(day: DayOfWeek): string {
  return DAYS_OF_WEEK.find((d) => d.id === day)?.short ?? day;
}

function getSkillBadgeVariant(level: SkillLevel): 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' {
  switch (level) {
    case 'beginner':
      return 'success';
    case 'intermediate':
      return 'primary';
    case 'advanced':
      return 'secondary';
    case 'expert':
      return 'accent';
    default:
      return 'default';
  }
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [formName, setFormName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formPrefecture, setFormPrefecture] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formInstruments, setFormInstruments] = useState<UserInstrument[]>([]);
  const [formGenres, setFormGenres] = useState<string[]>([]);
  const [formSchedule, setFormSchedule] = useState<Schedule[]>([]);
  const [formInfluences, setFormInfluences] = useState('');

  const enterEditMode = useCallback(() => {
    if (!user) return;
    setFormName(user.name);
    setFormNickname(user.nickname);
    setFormBio(user.bio);
    setFormPrefecture(user.prefecture);
    setFormCity(user.city);
    setFormInstruments([...user.instruments]);
    setFormGenres([...user.genres]);
    setFormSchedule([...user.schedule]);
    setFormInfluences(user.influences.join(', '));
    setIsEditing(true);
  }, [user]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!formName.trim()) {
      showToast('名前を入力してください', 'error');
      return;
    }
    if (!formNickname.trim()) {
      showToast('ニックネームを入力してください', 'error');
      return;
    }

    updateUser({
      name: formName.trim(),
      nickname: formNickname.trim(),
      bio: formBio.trim(),
      prefecture: formPrefecture,
      city: formCity.trim(),
      instruments: formInstruments,
      genres: formGenres,
      schedule: formSchedule,
      influences: formInfluences
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });

    setIsEditing(false);
    showToast('プロフィールを更新しました', 'success');
  }, [
    formName,
    formNickname,
    formBio,
    formPrefecture,
    formCity,
    formInstruments,
    formGenres,
    formSchedule,
    formInfluences,
    updateUser,
    showToast,
  ]);

  const toggleInstrument = useCallback((instrumentId: string) => {
    setFormInstruments((prev) => {
      const exists = prev.find((i) => i.instrument === instrumentId);
      if (exists) {
        return prev.filter((i) => i.instrument !== instrumentId);
      }
      return [...prev, { instrument: instrumentId, skillLevel: 'beginner' as SkillLevel, yearsPlaying: 0 }];
    });
  }, []);

  const updateInstrumentSkill = useCallback((instrumentId: string, skillLevel: SkillLevel) => {
    setFormInstruments((prev) =>
      prev.map((i) => (i.instrument === instrumentId ? { ...i, skillLevel } : i))
    );
  }, []);

  const toggleGenre = useCallback((genre: string) => {
    setFormGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }, []);

  const addScheduleSlot = useCallback(() => {
    setFormSchedule((prev) => [
      ...prev,
      { day: 'saturday' as DayOfWeek, startTime: '10:00', endTime: '18:00' },
    ]);
  }, []);

  const removeScheduleSlot = useCallback((index: number) => {
    setFormSchedule((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateScheduleSlot = useCallback(
    (index: number, field: keyof Schedule, value: string) => {
      setFormSchedule((prev) =>
        prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  if (!user) return null;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Profile Header */}
      <motion.div variants={item}>
        <GlassCard gradientBorder padding="lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar name={user.name} src={user.avatar} size="xl" online={user.isOnline} />
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="名前"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="名前を入力"
                    />
                    <Input
                      label="ニックネーム"
                      value={formNickname}
                      onChange={(e) => setFormNickname(e.target.value)}
                      placeholder="ニックネームを入力"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      自己紹介
                    </label>
                    <textarea
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      placeholder="自己紹介を入力"
                      rows={3}
                      className="w-full rounded-xl bg-surface-light/50 border border-border-light text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 px-4 py-2.5 text-sm resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        都道府県
                      </label>
                      <select
                        value={formPrefecture}
                        onChange={(e) => setFormPrefecture(e.target.value)}
                        className="w-full rounded-xl bg-surface-light/50 border border-border-light text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 px-4 py-2.5 text-sm"
                      >
                        <option value="">選択してください</option>
                        {PREFECTURES.map((pref) => (
                          <option key={pref} value={pref}>
                            {pref}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="市区町村"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="市区町村を入力"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                  <p className="text-sm text-primary-light">@{user.nickname}</p>
                  {user.bio && (
                    <p className="text-sm text-text-secondary mt-2">{user.bio}</p>
                  )}
                  {(user.prefecture || user.city) && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span>
                        {user.prefecture}
                        {user.city ? ` ${user.city}` : ''}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2 self-start">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                    キャンセル
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSave}>
                    保存
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" onClick={enterEditMode}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  編集
                </Button>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Instruments */}
      <motion.div variants={item}>
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">楽器・スキル</h2>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {INSTRUMENTS.map((inst) => {
                  const selected = formInstruments.some((i) => i.instrument === inst.id);
                  return (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => toggleInstrument(inst.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all duration-200 ${
                        selected
                          ? 'border-primary/50 bg-primary/10 text-primary-light'
                          : 'border-border-light bg-surface-light/30 text-text-secondary hover:border-primary/30'
                      }`}
                    >
                      <span>{inst.icon}</span>
                      <span>{inst.label}</span>
                    </button>
                  );
                })}
              </div>
              {formInstruments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border-light">
                  <p className="text-xs text-text-muted">選択した楽器のスキルレベル</p>
                  {formInstruments.map((inst) => (
                    <div
                      key={inst.instrument}
                      className="flex items-center gap-3 rounded-xl bg-surface-light/30 px-4 py-2"
                    >
                      <span className="text-sm">{getInstrumentIcon(inst.instrument)}</span>
                      <span className="text-sm text-foreground flex-1">
                        {getInstrumentLabel(inst.instrument)}
                      </span>
                      <select
                        value={inst.skillLevel}
                        onChange={(e) =>
                          updateInstrumentSkill(inst.instrument, e.target.value as SkillLevel)
                        }
                        className="rounded-lg bg-surface border border-border-light text-foreground text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {SKILL_LEVELS.map((sl) => (
                          <option key={sl.id} value={sl.id}>
                            {sl.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {user.instruments.length > 0 ? (
                <div className="space-y-2">
                  {user.instruments.map((inst) => (
                    <div
                      key={inst.instrument}
                      className="flex items-center gap-3 rounded-xl bg-surface-light/30 px-4 py-3"
                    >
                      <span className="text-lg">{getInstrumentIcon(inst.instrument)}</span>
                      <span className="text-sm font-medium text-foreground flex-1">
                        {getInstrumentLabel(inst.instrument)}
                      </span>
                      <Badge variant={getSkillBadgeVariant(inst.skillLevel)} size="sm">
                        {getSkillLabel(inst.skillLevel)}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        {inst.yearsPlaying < 1
                          ? `${Math.round(inst.yearsPlaying * 12)}ヶ月`
                          : `${inst.yearsPlaying}年`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">楽器が登録されていません</p>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Genres */}
      <motion.div variants={item}>
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">好きなジャンル</h2>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => {
                const selected = formGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                      selected
                        ? 'border-primary/50 bg-primary/20 text-primary-light'
                        : 'border-border-light bg-surface-light/30 text-text-secondary hover:border-primary/30'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.genres.length > 0 ? (
                user.genres.map((genre) => (
                  <Badge key={genre} variant="primary" size="md">
                    {genre}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-text-muted">ジャンルが登録されていません</p>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Schedule */}
      <motion.div variants={item}>
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">活動スケジュール</h2>
            {isEditing && (
              <Button variant="ghost" size="sm" onClick={addScheduleSlot}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                追加
              </Button>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-3">
              {formSchedule.length === 0 && (
                <p className="text-sm text-text-muted">
                  スケジュールが登録されていません。「追加」ボタンで追加してください。
                </p>
              )}
              {formSchedule.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-xl bg-surface-light/30 px-4 py-2"
                >
                  <select
                    value={slot.day}
                    onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)}
                    className="rounded-lg bg-surface border border-border-light text-foreground text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)}
                    className="rounded-lg bg-surface border border-border-light text-foreground text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-text-muted text-sm">~</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)}
                    className="rounded-lg bg-surface border border-border-light text-foreground text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => removeScheduleSlot(index)}
                    className="ml-auto text-text-muted hover:text-red-400 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {user.schedule.length > 0 ? (
                <div className="space-y-2">
                  {user.schedule.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl bg-surface-light/30 px-4 py-3"
                    >
                      <Badge variant="secondary" size="md">
                        {getDayLabel(slot.day)}
                      </Badge>
                      <span className="text-sm text-foreground">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">スケジュールが登録されていません</p>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Influences */}
      <motion.div variants={item}>
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">影響を受けたアーティスト</h2>
          {isEditing ? (
            <div>
              <Input
                value={formInfluences}
                onChange={(e) => setFormInfluences(e.target.value)}
                placeholder="カンマ区切りで入力 (例: ONE OK ROCK, BUMP OF CHICKEN)"
                helperText="カンマ(,)で区切って入力してください"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.influences.length > 0 ? (
                user.influences.map((influence) => (
                  <Badge key={influence} variant="secondary" size="md">
                    {influence}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-text-muted">
                  アーティストが登録されていません
                </p>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Save button (bottom, edit mode only) */}
      {isEditing && (
        <motion.div variants={item} className="flex justify-end gap-3 pb-4">
          <Button variant="ghost" onClick={cancelEdit}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSave}>
            変更を保存
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
