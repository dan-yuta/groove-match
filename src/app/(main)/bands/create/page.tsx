'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { INSTRUMENTS, GENRES, PREFECTURES } from '@/lib/constants';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { mockBands } from '@/data/mockBands';
import { Input, Button, GlassCard, Badge } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Band, InstrumentSlot } from '@/lib/types';

export default function CreateBandPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [instrumentSlots, setInstrumentSlots] = useState<InstrumentSlot[]>([]);
  const [newInstrument, setNewInstrument] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const addInstrumentSlot = () => {
    if (!newInstrument) return;
    if (instrumentSlots.length >= maxMembers) {
      showToast('最大メンバー数を超えるスロットは追加できません', 'warning');
      return;
    }
    setInstrumentSlots((prev) => [
      ...prev,
      { instrument: newInstrument, filled: false },
    ]);
    setNewInstrument('');
  };

  const removeInstrumentSlot = (index: number) => {
    setInstrumentSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const getInstrumentLabel = (instrumentId: string) => {
    return INSTRUMENTS.find((i) => i.id === instrumentId)?.label || instrumentId;
  };

  const getInstrumentIcon = (instrumentId: string) => {
    return INSTRUMENTS.find((i) => i.id === instrumentId)?.icon || '🎵';
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'バンド名を入力してください';
    if (name.trim().length > 50) newErrors.name = 'バンド名は50文字以内にしてください';
    if (!description.trim()) newErrors.description = '説明を入力してください';
    if (selectedGenres.length === 0) newErrors.genres = 'ジャンルを1つ以上選択してください';
    if (!prefecture) newErrors.prefecture = '都道府県を選択してください';
    if (!city.trim()) newErrors.city = '市区町村を入力してください';
    if (instrumentSlots.length === 0) newErrors.slots = '楽器スロットを1つ以上追加してください';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setSubmitting(true);

    const existingBands = storage.get<Band[]>('bands') || mockBands;
    const leaderInstrument = user.instruments.length > 0 ? user.instruments[0].instrument : instrumentSlots[0]?.instrument || 'other';

    const updatedSlots: InstrumentSlot[] = instrumentSlots.map((slot) => {
      if (slot.instrument === leaderInstrument && !slot.filled) {
        return { ...slot, filled: true, userId: user.id };
      }
      return slot;
    });

    const hasLeaderSlot = updatedSlots.some((s) => s.userId === user.id);
    if (!hasLeaderSlot) {
      updatedSlots.unshift({
        instrument: leaderInstrument,
        filled: true,
        userId: user.id,
      });
    }

    const newBand: Band = {
      id: `band-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      genre: selectedGenres,
      prefecture,
      city: city.trim(),
      members: [
        {
          userId: user.id,
          instrument: leaderInstrument,
          role: 'leader',
          joinedAt: new Date().toISOString(),
        },
      ],
      maxMembers,
      instrumentSlots: updatedSlots,
      imageUrl: '',
      isRecruiting: true,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    const updatedBands = [...existingBands, newBand];
    storage.set('bands', updatedBands);

    showToast('バンドを作成しました！', 'success');
    setSubmitting(false);
    router.push('/bands');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
          バンドを作成
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          新しいバンドを作成してメンバーを募集しましょう
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard>
          <h2 className="font-semibold text-lg mb-4">基本情報</h2>
          <div className="space-y-4">
            <Input
              label="バンド名"
              placeholder="バンド名を入力"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                説明
              </label>
              <textarea
                placeholder="バンドの説明、活動方針などを入力"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-surface-light/50 border border-border-light text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 pl-4 pr-4 py-2.5 text-sm resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-400">{errors.description}</p>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-semibold text-lg mb-4">ジャンル</h2>
          {errors.genres && (
            <p className="mb-2 text-xs text-red-400">{errors.genres}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
              >
                <Badge
                  variant={selectedGenres.includes(genre) ? 'primary' : 'default'}
                  size="md"
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedGenres.includes(genre)
                      ? 'ring-1 ring-primary/50'
                      : 'hover:bg-surface-lighter'
                  }`}
                >
                  {genre}
                </Badge>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-semibold text-lg mb-4">活動エリア</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                都道府県
              </label>
              <select
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                className="w-full rounded-xl bg-surface-light/50 border border-border-light text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 px-4 py-2.5 text-sm"
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
              {errors.prefecture && (
                <p className="mt-1 text-xs text-red-400">{errors.prefecture}</p>
              )}
            </div>
            <Input
              label="市区町村"
              placeholder="例: 新宿区"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-semibold text-lg mb-4">メンバー設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                最大メンバー数
              </label>
              <div className="flex items-center gap-3">
                {[3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMaxMembers(n)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      maxMembers === n
                        ? 'bg-primary text-white'
                        : 'bg-surface-light/50 border border-border-light text-text-secondary hover:border-primary/30'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                楽器スロット
              </label>
              {errors.slots && (
                <p className="mb-2 text-xs text-red-400">{errors.slots}</p>
              )}
              <div className="flex gap-2 mb-3">
                <select
                  value={newInstrument}
                  onChange={(e) => setNewInstrument(e.target.value)}
                  className="flex-1 rounded-xl bg-surface-light/50 border border-border-light text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 px-4 py-2.5 text-sm"
                >
                  <option value="">楽器を選択</option>
                  {INSTRUMENTS.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.icon} {inst.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addInstrumentSlot}
                  disabled={!newInstrument}
                >
                  追加
                </Button>
              </div>

              {instrumentSlots.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {instrumentSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-light/50 border border-border-light"
                    >
                      <span>{getInstrumentIcon(slot.instrument)}</span>
                      <span className="text-sm text-foreground">
                        {getInstrumentLabel(slot.instrument)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeInstrumentSlot(idx)}
                        className="ml-1 text-text-muted hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {instrumentSlots.length === 0 && (
                <p className="text-text-muted text-sm">
                  楽器スロットを追加して、募集するパートを設定しましょう
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/bands')}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            loading={submitting}
            className="flex-1"
          >
            バンドを作成
          </Button>
        </div>
      </form>
    </div>
  );
}
