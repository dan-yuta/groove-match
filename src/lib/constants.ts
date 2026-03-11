import { CopySong } from './types';

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

export const POPULAR_ARTISTS = [
  'ASIAN KUNG-FU GENERATION',
  'BUMP OF CHICKEN',
  'back number',
  'ONE OK ROCK',
  'RADWIMPS',
  'Official髭男dism',
  'Mrs. GREEN APPLE',
  'King Gnu',
  'ELLEGARDEN',
  'the pillows',
  '10-FEET',
  'WANIMA',
  'マキシマム ザ ホルモン',
  'MONGOL800',
  'HY',
  'GO!GO!7188',
  'チャットモンチー',
  'SHISHAMO',
  'SCANDAL',
  'SILENT SIREN',
];

export const COPY_SONGS: CopySong[] = [
  { id: 'song-01', title: 'リライト', artist: 'ASIAN KUNG-FU GENERATION', genre: 'ロック' },
  { id: 'song-02', title: '天体観測', artist: 'BUMP OF CHICKEN', genre: 'ロック' },
  { id: 'song-03', title: '高嶺の花子さん', artist: 'back number', genre: 'ポップス' },
  { id: 'song-04', title: 'Wherever you are', artist: 'ONE OK ROCK', genre: 'ロック' },
  { id: 'song-05', title: '前前前世', artist: 'RADWIMPS', genre: 'ロック' },
  { id: 'song-06', title: 'Pretender', artist: 'Official髭男dism', genre: 'ポップス' },
  { id: 'song-07', title: '青と夏', artist: 'Mrs. GREEN APPLE', genre: 'ポップス' },
  { id: 'song-08', title: '白日', artist: 'King Gnu', genre: 'ロック' },
  { id: 'song-09', title: 'Missing', artist: 'ELLEGARDEN', genre: 'パンク' },
  { id: 'song-10', title: 'Ride on Shooting Star', artist: 'the pillows', genre: 'オルタナティブ' },
  { id: 'song-11', title: 'RIVER', artist: '10-FEET', genre: 'パンク' },
  { id: 'song-12', title: 'ともに', artist: 'WANIMA', genre: 'パンク' },
  { id: 'song-13', title: '恋しくて', artist: 'MONGOL800', genre: 'パンク' },
  { id: 'song-14', title: 'AM11:00', artist: 'HY', genre: 'ポップス' },
  { id: 'song-15', title: '小さな恋のうた', artist: 'MONGOL800', genre: 'パンク' },
  { id: 'song-16', title: 'ないものねだり', artist: 'KANA-BOON', genre: 'ロック' },
  { id: 'song-17', title: '丸の内サディスティック', artist: '椎名林檎', genre: 'ロック' },
  { id: 'song-18', title: 'そばかす', artist: 'JUDY AND MARY', genre: 'ポップス' },
  { id: 'song-19', title: 'Don\'t say "lazy"', artist: '桜高軽音部', genre: 'アニソン' },
  { id: 'song-20', title: '残酷な天使のテーゼ', artist: '高橋洋子', genre: 'アニソン' },
];

export const BADGES = [
  { id: 'streak-3', name: '3日連続', description: '3日連続で練習達成', icon: '🔥' },
  { id: 'streak-7', name: '7日連続', description: '1週間連続で練習達成', icon: '🔥🔥' },
  { id: 'streak-30', name: '30日連続', description: '1ヶ月連続で練習達成', icon: '🔥🔥🔥' },
  { id: 'first-song', name: '初めての1曲', description: '1曲を「演奏可能」にした', icon: '🎸' },
  { id: 'first-band', name: '初コピバン結成', description: 'コピバンに参加した', icon: '🎤' },
  { id: 'setlist-complete', name: 'セットリスト完成', description: 'バンドの全曲が演奏可能に', icon: '🎵' },
  { id: 'first-live', name: '初ライブ', description: 'イベントに出演した', icon: '🎪' },
  { id: 'practice-100h', name: '100時間練習', description: '累計練習100時間達成', icon: '⏱' },
  { id: 'practice-10h', name: '10時間練習', description: '累計練習10時間達成', icon: '⏱' },
  { id: 'practice-500h', name: '500時間練習', description: '累計練習500時間達成', icon: '🏆' },
  { id: 'encourager', name: '応援者', description: 'フレンドを10回応援した', icon: '👏' },
  { id: 'rank-1', name: 'ランキング1位', description: '週間ランキングで1位を獲得', icon: '👑' },
];

export const SOCIAL_PROVIDERS = [
  { id: 'x', name: 'X (Twitter)', icon: '𝕏', urlPrefix: 'https://x.com/' },
  { id: 'instagram', name: 'Instagram', icon: '📷', urlPrefix: 'https://instagram.com/' },
  { id: 'line', name: 'LINE', icon: '💬', urlPrefix: '' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', urlPrefix: 'https://youtube.com/@' },
] as const;

export const SOCIAL_LOGIN_PROVIDERS = [
  { id: 'google' as const, name: 'Google', icon: 'G', color: '#4285F4' },
  { id: 'x' as const, name: 'X (Twitter)', icon: '𝕏', color: '#000000' },
  { id: 'instagram' as const, name: 'Instagram', icon: '📷', color: '#E4405F' },
] as const;

export const NOTIFICATION_TEMPLATES = {
  practice_reminder: { title: '練習の時間です！', message: '今日の練習まだだよ！ストリーク継続中🔥' },
  streak_warning: { title: 'ストリーク危機！', message: 'あと数時間でストリークが途切れます！' },
  slacking: { title: '最近練習してない？', message: '3日間練習していません。5分だけでもやろう！' },
  milestone: { title: 'おめでとう！', message: 'マイルストーンを達成しました！' },
} as const;

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['プロフィール作成', 'マッチング検索（1日3回）', 'コミュニティ閲覧', 'イベント閲覧'],
    maxBands: 1,
    maxMessages: 10,
    canCreateEvents: false,
    analyticsAccess: false,
    trialDays: 0,
    maxFriends: 5,
    ranking: 'friends',
    notifications: 'basic',
    maxSocialAccounts: 1,
  },
  pro: {
    name: 'Pro',
    price: 500,
    features: ['マッチング無制限', 'バンド作成無制限', 'メッセージ無制限', 'イベント作成', 'アナリティクス', '優先サポート'],
    maxBands: -1,
    maxMessages: -1,
    canCreateEvents: true,
    analyticsAccess: true,
    trialDays: 14,
    maxFriends: -1,
    ranking: 'all',
    notifications: 'full',
    maxSocialAccounts: -1,
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
