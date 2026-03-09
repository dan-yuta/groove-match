'use client';

import { useState, useMemo, useCallback } from 'react';
import { mockPosts, mockUsers } from '@/data';
import { MILESTONE_TYPES } from '@/lib/constants';
import { storage } from '@/lib/storage';
import { useAuth } from '@/lib/auth';
import { GlassCard, Card, Badge, Button, Avatar, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Post, PostType, Comment } from '@/lib/types';

const POST_TYPE_LABELS: Record<PostType, string> = {
  general: '一般',
  practice_log: '練習ログ',
  milestone: 'マイルストーン',
  question: '質問',
};

const POST_TYPE_VARIANTS: Record<PostType, 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning'> = {
  general: 'default',
  practice_log: 'secondary',
  milestone: 'accent',
  question: 'warning',
};

export default function CommunityPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<Post[]>(() => {
    return storage.get<Post[]>('posts') || mockPosts;
  });

  const [newPostType, setNewPostType] = useState<PostType>('general');
  const [newPostContent, setNewPostContent] = useState('');
  const [practiceMinutes, setPracticeMinutes] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts]);

  const getUserById = useCallback((userId: string) => {
    return mockUsers.find((u) => u.id === userId);
  }, []);

  const getMilestoneInfo = (milestoneType: string) => {
    return MILESTONE_TYPES.find((m) => m.id === milestoneType);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  const updatePostsInStorage = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    storage.set('posts', updatedPosts);
  };

  const handleCreatePost = () => {
    if (!user || !newPostContent.trim()) return;
    if (newPostType === 'practice_log' && !practiceMinutes) {
      showToast('練習時間を入力してください', 'warning');
      return;
    }
    if (newPostType === 'milestone' && !selectedMilestone) {
      showToast('マイルストーンの種類を選択してください', 'warning');
      return;
    }

    setSubmitting(true);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: user.id,
      type: newPostType,
      content: newPostContent.trim(),
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
      ...(newPostType === 'practice_log' && { practiceMinutes: parseInt(practiceMinutes) }),
      ...(newPostType === 'milestone' && { milestoneType: selectedMilestone }),
    };

    const updatedPosts = [newPost, ...posts];
    updatePostsInStorage(updatedPosts);

    setNewPostContent('');
    setPracticeMinutes('');
    setSelectedMilestone('');
    setNewPostType('general');
    setSubmitting(false);
    showToast('投稿しました！', 'success');
  };

  const handleToggleLike = (postId: string) => {
    if (!user) return;
    const updatedPosts = posts.map((post) => {
      if (post.id !== postId) return post;
      const hasLiked = post.likes.includes(user.id);
      return {
        ...post,
        likes: hasLiked
          ? post.likes.filter((id) => id !== user.id)
          : [...post.likes, user.id],
      };
    });
    updatePostsInStorage(updatedPosts);
  };

  const handleAddComment = (postId: string) => {
    if (!user) return;
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      userId: user.id,
      content,
      createdAt: new Date().toISOString(),
    };

    const updatedPosts = posts.map((post) => {
      if (post.id !== postId) return post;
      return { ...post, comments: [...post.comments, newComment] };
    });
    updatePostsInStorage(updatedPosts);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
          コミュニティ
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          練習ログやマイルストーンを共有しましょう
        </p>
      </div>

      {user && (
        <GlassCard gradientBorder>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(POST_TYPE_LABELS) as PostType[]).map((type) => (
                <button key={type} onClick={() => setNewPostType(type)}>
                  <Badge
                    variant={newPostType === type ? POST_TYPE_VARIANTS[type] : 'default'}
                    className={`cursor-pointer transition-all duration-200 ${
                      newPostType === type ? 'ring-1 ring-primary/50' : ''
                    }`}
                  >
                    {POST_TYPE_LABELS[type]}
                  </Badge>
                </button>
              ))}
            </div>

            <textarea
              placeholder={
                newPostType === 'question'
                  ? '質問を入力...'
                  : newPostType === 'practice_log'
                  ? '今日の練習内容を記録...'
                  : newPostType === 'milestone'
                  ? '達成したことを共有...'
                  : '何を投稿しますか？'
              }
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-surface-light/50 border border-border-light text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 px-4 py-2.5 text-sm resize-none"
            />

            {newPostType === 'practice_log' && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <Input
                  type="number"
                  placeholder="練習時間（分）"
                  value={practiceMinutes}
                  onChange={(e) => setPracticeMinutes(e.target.value)}
                  className="max-w-[200px]"
                />
                <span className="text-text-muted text-sm">分</span>
              </div>
            )}

            {newPostType === 'milestone' && (
              <div className="flex flex-wrap gap-2">
                {MILESTONE_TYPES.map((milestone) => (
                  <button
                    key={milestone.id}
                    onClick={() => setSelectedMilestone(milestone.id)}
                  >
                    <Badge
                      variant={selectedMilestone === milestone.id ? 'accent' : 'default'}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedMilestone === milestone.id ? 'ring-1 ring-accent/50' : ''
                      }`}
                    >
                      {milestone.icon} {milestone.label}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleCreatePost}
                loading={submitting}
                disabled={!newPostContent.trim()}
              >
                投稿する
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="space-y-4">
        {sortedPosts.map((post) => {
          const postUser = getUserById(post.userId);
          if (!postUser) return null;

          const hasLiked = user ? post.likes.includes(user.id) : false;
          const isCommentsExpanded = expandedComments[post.id] || false;
          const milestoneInfo = post.milestoneType ? getMilestoneInfo(post.milestoneType) : null;

          return (
            <GlassCard key={post.id}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={postUser.name}
                    size="md"
                    online={postUser.isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground text-sm">
                        {postUser.nickname || postUser.name}
                      </p>
                      <Badge variant={POST_TYPE_VARIANTS[post.type]} size="sm">
                        {POST_TYPE_LABELS[post.type]}
                      </Badge>
                    </div>
                    <p className="text-text-muted text-xs">{formatDate(post.createdAt)}</p>
                  </div>
                </div>

                {post.type === 'milestone' && milestoneInfo && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
                    <span className="text-xl">{milestoneInfo.icon}</span>
                    <span className="text-accent font-medium text-sm">{milestoneInfo.label}</span>
                  </div>
                )}

                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.type === 'practice_log' && post.practiceMinutes && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 border border-secondary/20">
                    <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-secondary-light font-medium text-sm">
                      {post.practiceMinutes}分間練習
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2 border-t border-border-light">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      hasLiked ? 'text-red-400' : 'text-text-muted hover:text-red-400'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill={hasLiked ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likes.length}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comments.length}</span>
                  </button>
                </div>

                {isCommentsExpanded && (
                  <div className="space-y-3 pt-2">
                    {post.comments.map((comment) => {
                      const commentUser = getUserById(comment.userId);
                      if (!commentUser) return null;
                      return (
                        <div key={comment.id} className="flex gap-2.5 pl-2">
                          <Avatar name={commentUser.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-foreground">
                                {commentUser.nickname || commentUser.name}
                              </span>
                              <span className="text-xs text-text-muted">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary mt-0.5">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })}

                    {user && (
                      <div className="flex gap-2 pl-2">
                        <Avatar name={user.name} size="sm" />
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="コメントを入力..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                            className="flex-1 rounded-lg bg-surface-light/50 border border-border-light text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 px-3 py-1.5 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentInputs[post.id]?.trim()}
                          >
                            送信
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {sortedPosts.length === 0 && (
        <GlassCard className="text-center py-12">
          <p className="text-text-muted text-lg mb-2">まだ投稿がありません</p>
          <p className="text-text-muted text-sm">最初の投稿をしてみましょう</p>
        </GlassCard>
      )}
    </div>
  );
}
