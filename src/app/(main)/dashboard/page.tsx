'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { GlassCard, Card, Badge, Button, Avatar } from '@/components/ui';
import { mockPosts, mockEvents, mockBands, mockUsers } from '@/data';
import { INSTRUMENTS } from '@/lib/constants';

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

function getUserName(userId: string): string {
  const found = mockUsers.find((u) => u.id === userId);
  return found?.nickname ?? found?.name ?? 'Unknown';
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}日前`;
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
}

const postTypeLabels: Record<string, { label: string; variant: 'primary' | 'secondary' | 'accent' | 'success' }> = {
  practice_log: { label: '練習ログ', variant: 'secondary' },
  milestone: { label: 'マイルストーン', variant: 'accent' },
  general: { label: '一般', variant: 'primary' },
  question: { label: '質問', variant: 'success' },
};

export default function DashboardPage() {
  const { user } = useAuth();

  const userBands = useMemo(() => {
    if (!user) return [];
    return mockBands.filter((band) =>
      band.members.some((m) => m.userId === user.id)
    );
  }, [user]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return mockEvents
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 2);
  }, []);

  const recentPosts = useMemo(() => {
    return [...mockPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, []);

  const stats = useMemo(() => {
    const practicePostsThisWeek = mockPosts.filter((p) => {
      if (p.type !== 'practice_log') return false;
      const postDate = new Date(p.createdAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return postDate >= weekAgo;
    });
    const totalPracticeMinutes = practicePostsThisWeek.reduce(
      (sum, p) => sum + (p.practiceMinutes ?? 0),
      0
    );
    const practiceHours = Math.round((totalPracticeMinutes / 60) * 10) / 10;

    return {
      matches: 12,
      bands: userBands.length,
      practiceHours,
      events: upcomingEvents.length,
    };
  }, [userBands, upcomingEvents]);

  if (!user) return null;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome */}
      <motion.div variants={item}>
        <GlassCard gradientBorder padding="lg">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.avatar} size="lg" online={user.isOnline} />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                おかえりなさい、{user.nickname || user.name}さん!
              </h1>
              <p className="text-text-secondary mt-1">
                今日も音楽を楽しみましょう
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'マッチング',
              value: stats.matches,
              unit: '件',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              color: 'from-primary/20 to-primary/5 text-primary-light',
            },
            {
              label: '参加バンド',
              value: stats.bands,
              unit: '組',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              ),
              color: 'from-secondary/20 to-secondary/5 text-secondary-light',
            },
            {
              label: '今週の練習',
              value: stats.practiceHours,
              unit: '時間',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              color: 'from-accent/20 to-accent/5 text-accent',
            },
            {
              label: '予定イベント',
              value: stats.events,
              unit: '件',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400',
            },
          ].map((stat) => (
            <Card key={stat.label} padding="md">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">
                    {stat.value}
                    <span className="text-xs font-normal text-text-secondary ml-0.5">
                      {stat.unit}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-foreground mb-4">クイックアクション</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'メンバー検索',
              href: '/matching',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              ),
              variant: 'primary' as const,
            },
            {
              label: 'バンド作成',
              href: '/bands',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              ),
              variant: 'secondary' as const,
            },
            {
              label: 'イベント一覧',
              href: '/events',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              variant: 'ghost' as const,
            },
            {
              label: '練習ログ',
              href: '/community',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              ),
              variant: 'ghost' as const,
            },
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <Button variant={action.variant} fullWidth className="h-auto py-4 flex-col gap-2">
                {action.icon}
                <span className="text-xs">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">最近のアクティビティ</h2>
            <Link href="/community">
              <Button variant="ghost" size="sm">すべて見る</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentPosts.map((post) => {
              const postUser = mockUsers.find((u) => u.id === post.userId);
              const typeInfo = postTypeLabels[post.type] ?? postTypeLabels.general;
              return (
                <Card key={post.id} padding="md" hover>
                  <div className="flex gap-3">
                    <Avatar
                      name={postUser?.name ?? 'U'}
                      src={postUser?.avatar}
                      size="md"
                      online={postUser?.isOnline}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">
                          {getUserName(post.userId)}
                        </span>
                        <Badge variant={typeInfo.variant} size="sm">
                          {typeInfo.label}
                        </Badge>
                        <span className="text-xs text-text-muted ml-auto">
                          {formatRelativeTime(post.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                          {post.likes.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                          </svg>
                          {post.comments.length}
                        </span>
                        {post.practiceMinutes != null && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {post.practiceMinutes}分
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">今後のイベント</h2>
              <Link href="/events">
                <Button variant="ghost" size="sm">もっと見る</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <GlassCard key={event.id} padding="md">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                        {event.title}
                      </h3>
                      {event.isBeginnerFriendly && (
                        <Badge variant="success" size="sm">初心者OK</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          {/* My Bands */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">マイバンド</h2>
              <Link href="/bands">
                <Button variant="ghost" size="sm">管理</Button>
              </Link>
            </div>
            {userBands.length > 0 ? (
              <div className="space-y-3">
                {userBands.map((band) => {
                  const memberInBand = band.members.find((m) => m.userId === user.id);
                  return (
                    <Card key={band.id} padding="md" hover>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {band.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {band.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-text-muted">
                              {band.members.length}/{band.maxMembers}人
                            </span>
                            {memberInBand && (
                              <Badge
                                variant={memberInBand.role === 'leader' ? 'accent' : 'primary'}
                                size="sm"
                              >
                                {memberInBand.role === 'leader' ? 'リーダー' : 'メンバー'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {memberInBand && (
                            <span className="text-[10px] text-text-muted">
                              {getInstrumentLabel(memberInBand.instrument)}
                            </span>
                          )}
                          {band.isRecruiting && (
                            <Badge variant="success" size="sm">募集中</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {band.genre.map((g) => (
                          <Badge key={g} variant="default" size="sm">{g}</Badge>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card padding="md">
                <div className="text-center py-4">
                  <p className="text-sm text-text-muted mb-3">まだバンドに参加していません</p>
                  <Link href="/bands">
                    <Button variant="secondary" size="sm">バンドを探す</Button>
                  </Link>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
