'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, GlassCard } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { validateEmail, validatePassword, validateName, validateNickname } from '@/lib/validators';
import { INSTRUMENTS, SKILL_LEVELS, GENRES, PREFECTURES, DAYS_OF_WEEK } from '@/lib/constants';
import type { UserInstrument, SkillLevel, DayOfWeek, Schedule } from '@/lib/types';

const TOTAL_STEPS = 3;

const STEP_LABELS = ['基本情報', '音楽プロフィール', '場所・スケジュール'];

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  instruments: UserInstrument[];
  genres: string[];
  prefecture: string;
  city: string;
  schedule: Schedule[];
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    instruments: [],
    genres: [],
    prefecture: '',
    city: '',
    schedule: [],
  });

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next.general;
      return next;
    });
  };

  // --- Validation per step ---

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const nicknameError = validateNickname(formData.nickname);

    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (nicknameError) newErrors.nickname = nicknameError;
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワード（確認）を入力してください';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.instruments.length === 0) {
      newErrors.instruments = '少なくとも1つの楽器を選択してください';
    }
    if (formData.genres.length === 0) {
      newErrors.genres = '少なくとも1つのジャンルを選択してください';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.prefecture) {
      newErrors.prefecture = '都道府県を選択してください';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Navigation ---

  const handleNext = () => {
    let valid = false;
    if (step === 1) valid = validateStep1();
    if (step === 2) valid = validateStep2();
    if (valid) {
      setStep((s) => s + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    setErrors({});
  };

  // --- Instruments ---

  const toggleInstrument = (instrumentId: string) => {
    setFormData((prev) => {
      const exists = prev.instruments.find((i) => i.instrument === instrumentId);
      if (exists) {
        return { ...prev, instruments: prev.instruments.filter((i) => i.instrument !== instrumentId) };
      }
      return {
        ...prev,
        instruments: [...prev.instruments, { instrument: instrumentId, skillLevel: 'beginner' as SkillLevel, yearsPlaying: 0 }],
      };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.instruments;
      return next;
    });
  };

  const updateInstrumentSkill = (instrumentId: string, skillLevel: SkillLevel) => {
    setFormData((prev) => ({
      ...prev,
      instruments: prev.instruments.map((i) =>
        i.instrument === instrumentId ? { ...i, skillLevel } : i
      ),
    }));
  };

  // --- Genres ---

  const toggleGenre = (genre: string) => {
    setFormData((prev) => {
      const exists = prev.genres.includes(genre);
      return {
        ...prev,
        genres: exists ? prev.genres.filter((g) => g !== genre) : [...prev.genres, genre],
      };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.genres;
      return next;
    });
  };

  // --- Schedule ---

  const toggleScheduleDay = (day: DayOfWeek) => {
    setFormData((prev) => {
      const exists = prev.schedule.find((s) => s.day === day);
      if (exists) {
        return { ...prev, schedule: prev.schedule.filter((s) => s.day !== day) };
      }
      return {
        ...prev,
        schedule: [...prev.schedule, { day, startTime: '18:00', endTime: '22:00' }],
      };
    });
  };

  // --- Submit ---

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        instruments: formData.instruments,
        genres: formData.genres,
        prefecture: formData.prefecture,
        city: formData.city,
        schedule: formData.schedule,
      });

      if (result.success) {
        router.push('/dashboard');
      } else {
        setErrors({ general: result.error || '登録に失敗しました' });
      }
    } catch {
      setErrors({ general: '予期しないエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  // --- Slide animation direction ---

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 80 : -80, opacity: 0 }),
  };

  const [direction, setDirection] = useState(0);

  const goNext = () => { setDirection(1); handleNext(); };
  const goBack = () => { setDirection(-1); handleBack(); };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Gradient background effects */}
      <div
        className="pointer-events-none absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full opacity-25 blur-[100px]"
        style={{ background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full opacity-10 blur-[80px]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">新規登録</h1>
          <p className="text-text-secondary text-sm">
            BandMatchに参加して、理想の音楽仲間を見つけよう
          </p>
        </motion.div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === step;
              const isCompleted = stepNum < step;
              return (
                <div key={stepNum} className="flex items-center flex-1">
                  {/* Step circle */}
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-primary to-secondary text-white'
                          : isActive
                            ? 'bg-primary/20 text-primary-light border-2 border-primary'
                            : 'bg-surface-light text-text-muted border border-border-light'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-[10px] font-medium transition-colors ${
                        isActive ? 'text-primary-light' : isCompleted ? 'text-text-secondary' : 'text-text-muted'
                      }`}
                    >
                      {STEP_LABELS[i]}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < TOTAL_STEPS - 1 && (
                    <div className="flex-1 h-0.5 mx-1 mb-5 relative">
                      <div className="absolute inset-0 bg-surface-lighter rounded-full" />
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                        initial={false}
                        animate={{ width: isCompleted ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <GlassCard gradientBorder padding="lg">
          <form onSubmit={handleSubmit}>
            {/* General error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 mb-5"
              >
                {errors.general}
              </motion.div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              {/* --- Step 1: Basic info --- */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-4"
                >
                  <Input
                    label="名前"
                    placeholder="山田太郎"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    error={errors.name}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  />
                  <Input
                    label="ニックネーム"
                    placeholder="表示名（20文字以内）"
                    value={formData.nickname}
                    onChange={(e) => updateField('nickname', e.target.value)}
                    error={errors.nickname}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    }
                  />
                  <Input
                    label="メールアドレス"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                  <Input
                    label="パスワード"
                    type="password"
                    placeholder="8文字以上（英字+数字）"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    error={errors.password}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  />
                  <Input
                    label="パスワード（確認）"
                    type="password"
                    placeholder="パスワードを再入力"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                  />
                </motion.div>
              )}

              {/* --- Step 2: Music profile --- */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  {/* Instruments */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                      楽器を選択
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {INSTRUMENTS.map((inst) => {
                        const selected = formData.instruments.some((i) => i.instrument === inst.id);
                        return (
                          <button
                            key={inst.id}
                            type="button"
                            onClick={() => toggleInstrument(inst.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                              selected
                                ? 'bg-primary/20 text-primary-light border border-primary/40'
                                : 'bg-surface-light/50 text-text-secondary border border-border-light hover:border-primary/30 hover:bg-surface-lighter/50'
                            }`}
                          >
                            <span className="text-base">{inst.icon}</span>
                            <span className="truncate">{inst.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.instruments && (
                      <p className="mt-1.5 text-xs text-red-400">{errors.instruments}</p>
                    )}
                  </div>

                  {/* Skill level per selected instrument */}
                  {formData.instruments.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        スキルレベル
                      </label>
                      <div className="space-y-3">
                        {formData.instruments.map((userInst) => {
                          const meta = INSTRUMENTS.find((i) => i.id === userInst.instrument);
                          return (
                            <div key={userInst.instrument} className="flex items-center gap-3">
                              <span className="text-sm text-text-secondary min-w-[100px] truncate">
                                {meta?.icon} {meta?.label}
                              </span>
                              <select
                                value={userInst.skillLevel}
                                onChange={(e) => updateInstrumentSkill(userInst.instrument, e.target.value as SkillLevel)}
                                className="flex-1 rounded-xl bg-surface-light/50 border border-border-light text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                              >
                                {SKILL_LEVELS.map((sl) => (
                                  <option key={sl.id} value={sl.id}>
                                    {sl.label} - {sl.description}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Genres */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                      好きなジャンル
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((genre) => {
                        const selected = formData.genres.includes(genre);
                        return (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => toggleGenre(genre)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                              selected
                                ? 'bg-secondary/20 text-secondary-light border border-secondary/40'
                                : 'bg-surface-light/50 text-text-muted border border-border-light hover:border-secondary/30 hover:text-text-secondary'
                            }`}
                          >
                            {genre}
                          </button>
                        );
                      })}
                    </div>
                    {errors.genres && (
                      <p className="mt-1.5 text-xs text-red-400">{errors.genres}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* --- Step 3: Location & Schedule --- */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-5"
                >
                  {/* Prefecture */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      都道府県
                    </label>
                    <select
                      value={formData.prefecture}
                      onChange={(e) => updateField('prefecture', e.target.value)}
                      className={`w-full rounded-xl bg-surface-light/50 border text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 ${
                        errors.prefecture ? 'border-red-500/50' : 'border-border-light'
                      } ${formData.prefecture ? 'text-foreground' : 'text-text-muted'}`}
                    >
                      <option value="">選択してください</option>
                      {PREFECTURES.map((pref) => (
                        <option key={pref} value={pref}>
                          {pref}
                        </option>
                      ))}
                    </select>
                    {errors.prefecture && (
                      <p className="mt-1 text-xs text-red-400">{errors.prefecture}</p>
                    )}
                  </div>

                  {/* City */}
                  <Input
                    label="市区町村（任意）"
                    placeholder="例：渋谷区"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    error={errors.city}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  />

                  {/* Schedule */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                      活動可能な曜日（任意）
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const selected = formData.schedule.some((s) => s.day === day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleScheduleDay(day.id)}
                            className={`w-11 h-11 rounded-xl text-sm font-semibold transition-all duration-200 ${
                              selected
                                ? 'bg-primary/20 text-primary-light border border-primary/40'
                                : 'bg-surface-light/50 text-text-muted border border-border-light hover:border-primary/30 hover:text-text-secondary'
                            }`}
                          >
                            {day.short}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-1.5 text-xs text-text-muted">
                      選択した曜日はデフォルトで18:00〜22:00に設定されます
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button type="button" variant="secondary" onClick={goBack} className="flex-1">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  戻る
                </Button>
              )}
              {step < TOTAL_STEPS ? (
                <Button type="button" onClick={goNext} className="flex-1">
                  次へ
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              ) : (
                <Button type="submit" loading={loading} className="flex-1" size="lg">
                  登録する
                </Button>
              )}
            </div>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-sm text-text-secondary">
            すでにアカウントをお持ちですか？{' '}
            <Link
              href="/login"
              className="text-primary-light hover:text-primary font-medium transition-colors"
            >
              ログイン
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
