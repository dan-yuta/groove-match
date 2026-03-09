export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type SubscriptionPlan = 'free' | 'basic' | 'premium';
export type PostType = 'general' | 'practice_log' | 'milestone' | 'question';

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
  isAdmin: boolean;
  subscription: SubscriptionPlan;
  createdAt: string;
  lastLoginAt: string;
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
