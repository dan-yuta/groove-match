export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type SubscriptionPlan = 'free' | 'pro';
export type PostType = 'general' | 'practice_log' | 'milestone' | 'question' | 'cover_video';

export interface CopySong {
  id: string;
  title: string;
  artist: string;
  genre: string;
}

export interface SetlistItem {
  songId: string;
  status: 'want' | 'practicing' | 'ready' | 'performed';
}

export interface UserInstrument {
  instrument: string;
  skillLevel: SkillLevel;
  yearsPlaying: number;
}

export interface Schedule {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface PracticeLog {
  id: string;
  userId: string;
  songId: string;
  minutes: number;
  note: string;
  date: string;
}

export interface PracticeStreak {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  totalMinutes: number;
  weeklyGoalDays: number;
  weeklyGoalMinutes: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export type SocialLoginProvider = 'google' | 'x' | 'instagram';

export interface SocialAccount {
  provider: 'x' | 'instagram' | 'line' | 'youtube';
  username: string;
  url: string;
}

export type AuthProvider = 'email' | SocialLoginProvider;

export interface FriendRelation {
  userId: string;
  friendId: string;
  since: string;
}

export type NotificationType =
  | 'practice_reminder'
  | 'friend_practiced'
  | 'streak_warning'
  | 'rank_change'
  | 'milestone'
  | 'slacking'
  | 'band_reminder';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  nickname: string;
  avatar: string;
  bio: string;
  prefecture: string;
  city: string;
  instruments: UserInstrument[];
  genres: string[];
  schedule: Schedule[];
  influences: string[];
  wantToPlaySongs: string[];   // CopySong IDs
  canPlaySongs: string[];       // CopySong IDs
  favoriteArtists: string[];    // コピーしたいアーティスト
  practiceStreak: PracticeStreak;
  socialAccounts: SocialAccount[];
  friends: string[];  // friend user IDs
  badges: string[];   // badge IDs
  isAdmin: boolean;
  subscription: SubscriptionPlan;
  createdAt: string;
  lastLoginAt: string;
  authProvider: AuthProvider;
  isOnline: boolean;
}

export interface Band {
  id: string;
  name: string;
  description: string;
  genre: string[];
  prefecture: string;
  city: string;
  members: BandMember[];
  maxMembers: number;
  instrumentSlots: InstrumentSlot[];
  imageUrl: string;
  isRecruiting: boolean;
  setlist: SetlistItem[];
  targetArtists: string[];
  createdAt: string;
  createdBy: string;
}

export interface BandMember {
  userId: string;
  instrument: string;
  role: 'leader' | 'member';
  joinedAt: string;
}

export interface InstrumentSlot {
  instrument: string;
  filled: boolean;
  userId?: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  venue: string;
  address: string;
  prefecture: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  registeredBands: string[];
  tags: string[];
  isBeginnerFriendly: boolean;
  fee: number;
  imageUrl: string;
  organizerId: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
  practiceMinutes?: number;
  milestoneType?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface MatchResult {
  user: User;
  score: number;
  breakdown: {
    area: number;
    instrument: number;
    genre: number;
    skill: number;
    schedule: number;
    songs: number;
  };
}

export interface BillingRecord {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalBands: number;
  totalEvents: number;
  monthlyRevenue: number;
  subscriptionBreakdown: Record<SubscriptionPlan, number>;
}

// Chat types
export type ChatRoomType = 'dm' | 'band';

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name?: string;           // band chat uses band name
  bandId?: string;         // set for band group chats
  members: string[];       // user IDs
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

// Practice Schedule (Calendar) types
export type ScheduleStatus = 'proposed' | 'confirmed' | 'cancelled' | 'completed';
export type ScheduleResponse = 'ok' | 'ng' | 'pending';

export interface PracticeSchedule {
  id: string;
  bandId: string;
  proposedBy: string;      // user ID
  title: string;
  date: string;            // YYYY-MM-DD
  startTime: string;       // HH:mm
  endTime: string;         // HH:mm
  studioName?: string;
  studioAddress?: string;
  note?: string;
  status: ScheduleStatus;
  responses: PracticeScheduleResponse[];
  createdAt: string;
}

export interface PracticeScheduleResponse {
  userId: string;
  response: ScheduleResponse;
  respondedAt?: string;
}
