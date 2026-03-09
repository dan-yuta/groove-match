export const INSTRUMENTS = [
  { id: 'vocal', label: 'ボーカル', icon: '🎤' },
  { id: 'electric_guitar', label: 'エレキギター', icon: '🎸' },
  { id: 'acoustic_guitar', label: 'アコースティックギター', icon: '🎸' },
  { id: 'bass', label: 'ベース', icon: '🎸' },
  { id: 'drums', label: 'ドラム', icon: '🥁' },
  { id: 'keyboard', label: 'キーボード', icon: '🎹' },
  { id: 'synthesizer', label: 'シンセサイザー', icon: '🎹' },
  { id: 'saxophone', label: 'サックス', icon: '🎷' },
  { id: 'trumpet', label: 'トランペット', icon: '🎺' },
  { id: 'violin', label: 'バイオリン', icon: '🎻' },
  { id: 'dj', label: 'DJ', icon: '💿' },
  { id: 'other', label: 'その他', icon: '🎵' },
];

export const SKILL_LEVELS = [
  { id: 'beginner' as const, label: '初心者', description: '始めたばかり（0-6ヶ月）' },
  { id: 'intermediate' as const, label: '中級者', description: '基本が身についた（6ヶ月-2年）' },
  { id: 'advanced' as const, label: '上級者', description: 'ライブ経験あり（2-5年）' },
  { id: 'expert' as const, label: 'エキスパート', description: 'プロレベル（5年以上）' },
];

export const GENRES = [
  'ロック', 'ポップス', 'ジャズ', 'ブルース', 'メタル', 'パンク',
  'フォーク', 'クラシック', 'R&B', 'ヒップホップ', 'エレクトロニカ',
  'レゲエ', 'カントリー', 'ファンク', 'ソウル', 'インディー',
  'オルタナティブ', 'プログレッシブ', 'アニソン', 'ボカロ',
];

export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

export const DAYS_OF_WEEK = [
  { id: 'monday' as const, label: '月曜日', short: '月' },
  { id: 'tuesday' as const, label: '火曜日', short: '火' },
  { id: 'wednesday' as const, label: '水曜日', short: '水' },
  { id: 'thursday' as const, label: '木曜日', short: '木' },
  { id: 'friday' as const, label: '金曜日', short: '金' },
  { id: 'saturday' as const, label: '土曜日', short: '土' },
  { id: 'sunday' as const, label: '日曜日', short: '日' },
];

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['プロフィール作成', 'マッチング検索（1日3回）', 'コミュニティ閲覧', 'イベント閲覧'],
    maxBands: 1,
    maxMessages: 10,
    canCreateEvents: false,
    analyticsAccess: false,
  },
  basic: {
    name: 'Basic',
    price: 980,
    features: ['マッチング無制限', 'バンド作成（3つまで）', 'メッセージ無制限', 'イベント作成', '練習ログ機能', 'マイルストーン機能'],
    maxBands: 3,
    maxMessages: -1,
    canCreateEvents: true,
    analyticsAccess: false,
  },
  premium: {
    name: 'Premium',
    price: 1980,
    features: ['全Basic機能', 'バンド作成無制限', '優先マッチング', 'アナリティクス', 'プレミアムバッジ', 'イベント優先掲載'],
    maxBands: -1,
    maxMessages: -1,
    canCreateEvents: true,
    analyticsAccess: true,
  },
} as const;

export const MILESTONE_TYPES = [
  { id: 'first_session', label: '初セッション', icon: '🎵' },
  { id: 'first_live', label: '初ライブ', icon: '🎤' },
  { id: 'band_formed', label: 'バンド結成', icon: '🎸' },
  { id: 'practice_streak', label: '練習連続記録', icon: '🔥' },
  { id: 'song_mastered', label: '曲マスター', icon: '⭐' },
  { id: 'new_instrument', label: '新楽器挑戦', icon: '🎹' },
];

export const STORAGE_PREFIX = 'bandmatch-';
