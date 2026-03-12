import { ChatRoom, ChatMessage } from '@/lib/types';

// DM: user-1 (田中太郎) <-> user-2 (佐藤花子)
const dmRoom1Messages: ChatMessage[] = [
  {
    id: 'msg-dm1-1',
    roomId: 'room-dm-1',
    senderId: 'user-1',
    content: '天体観測の練習、次いつにする？',
    createdAt: '2026-03-08T18:30:00Z',
  },
  {
    id: 'msg-dm1-2',
    roomId: 'room-dm-1',
    senderId: 'user-2',
    content: '来週の土曜はどう？午後なら空いてるよ',
    createdAt: '2026-03-08T18:35:00Z',
  },
  {
    id: 'msg-dm1-3',
    roomId: 'room-dm-1',
    senderId: 'user-1',
    content: 'いいね！スタジオペンタ新宿で予約しとくよ',
    createdAt: '2026-03-08T18:40:00Z',
  },
  {
    id: 'msg-dm1-4',
    roomId: 'room-dm-1',
    senderId: 'user-2',
    content: 'ありがとう！ドラムのフィル部分もう少し詰めたいんだよね',
    createdAt: '2026-03-08T18:42:00Z',
  },
  {
    id: 'msg-dm1-5',
    roomId: 'room-dm-1',
    senderId: 'user-1',
    content: 'わかる、サビ前のとこ難しいよね。一緒に合わせよう',
    createdAt: '2026-03-08T18:45:00Z',
  },
];

// DM: user-1 (田中太郎) <-> user-3 (鈴木一郎)
const dmRoom2Messages: ChatMessage[] = [
  {
    id: 'msg-dm2-1',
    roomId: 'room-dm-2',
    senderId: 'user-3',
    content: '来月のイベント、アジカンtributeで出ない？',
    createdAt: '2026-03-09T10:00:00Z',
  },
  {
    id: 'msg-dm2-2',
    roomId: 'room-dm-2',
    senderId: 'user-1',
    content: 'いいね！どのイベント？',
    createdAt: '2026-03-09T10:05:00Z',
  },
  {
    id: 'msg-dm2-3',
    roomId: 'room-dm-2',
    senderId: 'user-3',
    content: '下北沢のコピバンフェスだよ。4月12日開催',
    createdAt: '2026-03-09T10:08:00Z',
  },
  {
    id: 'msg-dm2-4',
    roomId: 'room-dm-2',
    senderId: 'user-1',
    content: 'おー、出たい！セトリどうする？',
    createdAt: '2026-03-09T10:12:00Z',
  },
  {
    id: 'msg-dm2-5',
    roomId: 'room-dm-2',
    senderId: 'user-3',
    content: 'リライトとソラニンは絶対やりたい。あと遥か彼方も',
    createdAt: '2026-03-09T10:15:00Z',
  },
  {
    id: 'msg-dm2-6',
    roomId: 'room-dm-2',
    senderId: 'user-1',
    content: 'いいセトリだね！バンドチャットで相談しよう',
    createdAt: '2026-03-09T10:18:00Z',
  },
];

// Band group chat: band-1 (BUMPコピバン) - members: user-1, user-2
const bandRoom1Messages: ChatMessage[] = [
  {
    id: 'msg-band1-1',
    roomId: 'room-band-1',
    senderId: 'user-1',
    content: '今週のスタジオ練習お疲れ様でした！天体観測だいぶ仕上がってきたね',
    createdAt: '2026-03-07T21:00:00Z',
  },
  {
    id: 'msg-band1-2',
    roomId: 'room-band-1',
    senderId: 'user-2',
    content: 'お疲れ！イントロのリズム合ってきたと思う。次はカルマもやりたいな',
    createdAt: '2026-03-07T21:05:00Z',
  },
  {
    id: 'msg-band1-3',
    roomId: 'room-band-1',
    senderId: 'user-1',
    content: 'カルマいいね！ベースとボーカル早く見つけたいな',
    createdAt: '2026-03-07T21:10:00Z',
  },
  {
    id: 'msg-band1-4',
    roomId: 'room-band-1',
    senderId: 'user-2',
    content: '募集ページのアクセス増えてるみたいだから期待しよう',
    createdAt: '2026-03-07T21:15:00Z',
  },
  {
    id: 'msg-band1-5',
    roomId: 'room-band-1',
    senderId: 'user-1',
    content: '来週3/15のスタジオ予約したよ。スタジオペンタ新宿 14:00-17:00',
    createdAt: '2026-03-08T12:00:00Z',
  },
  {
    id: 'msg-band1-6',
    roomId: 'room-band-1',
    senderId: 'user-2',
    content: '了解！カルマの音源聴いてイメトレしとくね',
    createdAt: '2026-03-08T12:10:00Z',
  },
];

// Band group chat: band-2 (アジカンtribute) - members: user-3, user-6
const bandRoom2Messages: ChatMessage[] = [
  {
    id: 'msg-band2-1',
    roomId: 'room-band-2',
    senderId: 'user-3',
    content: '4月のコピバンフェス、エントリーしたよ！',
    createdAt: '2026-03-09T15:00:00Z',
  },
  {
    id: 'msg-band2-2',
    roomId: 'room-band-2',
    senderId: 'user-6',
    content: 'ナイス！リライトの練習ちゃんとしないとね',
    createdAt: '2026-03-09T15:05:00Z',
  },
  {
    id: 'msg-band2-3',
    roomId: 'room-band-2',
    senderId: 'user-3',
    content: 'セトリ案: リライト→ソラニン→遥か彼方。どう思う？',
    createdAt: '2026-03-09T15:10:00Z',
  },
  {
    id: 'msg-band2-4',
    roomId: 'room-band-2',
    senderId: 'user-6',
    content: '完璧じゃん！リライトで掴んでソラニンでしっとり、遥か彼方で締めるの最高',
    createdAt: '2026-03-09T15:15:00Z',
  },
  {
    id: 'msg-band2-5',
    roomId: 'room-band-2',
    senderId: 'user-3',
    content: '来週スタジオノア中野で合わせたいんだけど、水曜の夜空いてる？',
    createdAt: '2026-03-09T15:20:00Z',
  },
  {
    id: 'msg-band2-6',
    roomId: 'room-band-2',
    senderId: 'user-6',
    content: '水曜OK！19時からでいい？',
    createdAt: '2026-03-09T15:22:00Z',
  },
  {
    id: 'msg-band2-7',
    roomId: 'room-band-2',
    senderId: 'user-3',
    content: 'おけ！ギターのメンバーも早く決めたいな。イベントまであと1ヶ月だし',
    createdAt: '2026-03-09T15:25:00Z',
  },
];

export const mockChatRooms: ChatRoom[] = [
  {
    id: 'room-dm-1',
    type: 'dm',
    members: ['user-1', 'user-2'],
    lastMessage: dmRoom1Messages[dmRoom1Messages.length - 1],
    createdAt: '2026-03-08T18:30:00Z',
    updatedAt: '2026-03-08T18:45:00Z',
  },
  {
    id: 'room-dm-2',
    type: 'dm',
    members: ['user-1', 'user-3'],
    lastMessage: dmRoom2Messages[dmRoom2Messages.length - 1],
    createdAt: '2026-03-09T10:00:00Z',
    updatedAt: '2026-03-09T10:18:00Z',
  },
  {
    id: 'room-band-1',
    type: 'band',
    name: 'BUMPコピバン',
    bandId: 'band-1',
    members: ['user-1', 'user-2'],
    lastMessage: bandRoom1Messages[bandRoom1Messages.length - 1],
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2026-03-08T12:10:00Z',
  },
  {
    id: 'room-band-2',
    type: 'band',
    name: 'アジカンtribute',
    bandId: 'band-2',
    members: ['user-3', 'user-6'],
    lastMessage: bandRoom2Messages[bandRoom2Messages.length - 1],
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-03-09T15:25:00Z',
  },
];

export const mockChatMessages: ChatMessage[] = [
  ...dmRoom1Messages,
  ...dmRoom2Messages,
  ...bandRoom1Messages,
  ...bandRoom2Messages,
];
