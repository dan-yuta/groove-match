'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { ChatRoom, ChatMessage, User } from '@/lib/types';
import { GlassCard, Badge, Button, Avatar } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { mockChatRooms, mockChatMessages } from '@/data';
import { mockUsers, mockBands } from '@/data';

type ChatTab = 'dm' | 'band';

function formatTime(dateStr: string) {
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
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function getUserById(userId: string): User | undefined {
  return mockUsers.find((u) => u.id === userId);
}

export default function ChatPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [chatTab, setChatTab] = useState<ChatTab>('dm');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return storage.get<ChatMessage[]>('chatMessages') || mockChatMessages;
  });
  const [rooms, setRooms] = useState<ChatRoom[]>(() => {
    return storage.get<ChatRoom[]>('chatRooms') || mockChatRooms;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter rooms by tab and current user membership
  const filteredRooms = useMemo(() => {
    if (!user) return [];
    return rooms
      .filter((r) => r.type === chatTab && r.members.includes(user.id))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [rooms, chatTab, user]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  const roomMessages = useMemo(() => {
    if (!selectedRoomId) return [];
    return messages
      .filter((m) => m.roomId === selectedRoomId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, selectedRoomId]);

  // Scroll to bottom when messages change or room selected
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages, selectedRoomId]);

  // Focus input when room selected
  useEffect(() => {
    if (selectedRoomId) {
      inputRef.current?.focus();
    }
  }, [selectedRoomId]);

  const getRoomDisplayName = (room: ChatRoom): string => {
    if (room.type === 'band') return room.name || 'バンドチャット';
    if (!user) return '';
    const otherId = room.members.find((id) => id !== user.id);
    const otherUser = otherId ? getUserById(otherId) : null;
    return otherUser?.nickname || otherUser?.name || 'ユーザー';
  };

  const getRoomAvatar = (room: ChatRoom): { name: string; online?: boolean } => {
    if (room.type === 'band') {
      return { name: room.name || 'B' };
    }
    if (!user) return { name: '' };
    const otherId = room.members.find((id) => id !== user.id);
    const otherUser = otherId ? getUserById(otherId) : null;
    return { name: otherUser?.name || '', online: otherUser?.isOnline };
  };

  const handleSend = () => {
    if (!user || !inputValue.trim() || !selectedRoomId) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId: selectedRoomId,
      senderId: user.id,
      content: inputValue.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    storage.set('chatMessages', updatedMessages);

    // Update room's lastMessage and updatedAt
    const updatedRooms = rooms.map((r) => {
      if (r.id !== selectedRoomId) return r;
      return { ...r, lastMessage: newMessage, updatedAt: newMessage.createdAt };
    });
    setRooms(updatedRooms);
    storage.set('chatRooms', updatedRooms);

    setInputValue('');
    showToast('メッセージを送信しました', 'success');
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setInputValue('');
  };

  const handleBack = () => {
    setSelectedRoomId(null);
  };

  // Pro-only access check
  if (user && user.subscription !== 'pro') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">チャット</h1>
          <p className="text-text-muted text-sm mt-1">バンドメンバーやフレンドとメッセージしよう</p>
        </div>
        <GlassCard className="text-center py-12">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-foreground font-medium mb-2">チャット機能はProプラン限定です</p>
          <p className="text-text-muted text-sm mb-4">
            Proプランにアップグレードしてバンドメンバーやフレンドとメッセージしましょう
          </p>
          <Button
            onClick={() => {
              window.location.href = '/subscription';
            }}
          >
            Proプランにアップグレード
          </Button>
        </GlassCard>
      </div>
    );
  }

  // Room list component
  const RoomList = () => (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold gradient-text">チャット</h1>
        <p className="text-text-muted text-sm mt-1">バンドメンバーやフレンドとメッセージしよう</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setChatTab('dm')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            chatTab === 'dm' ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:bg-surface-lighter'
          }`}
        >
          DM
        </button>
        <button
          onClick={() => setChatTab('band')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            chatTab === 'band' ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:bg-surface-lighter'
          }`}
        >
          バンド
        </button>
      </div>

      {/* Room list */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {filteredRooms.length === 0 && (
          <GlassCard className="text-center py-8">
            <p className="text-text-muted text-sm">
              {chatTab === 'dm' ? 'DMはまだありません' : 'バンドチャットはまだありません'}
            </p>
          </GlassCard>
        )}
        {filteredRooms.map((room, i) => {
          const avatar = getRoomAvatar(room);
          const displayName = getRoomDisplayName(room);
          const isSelected = room.id === selectedRoomId;

          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => handleSelectRoom(room.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  isSelected
                    ? 'bg-primary/15 border border-primary/30'
                    : 'bg-surface-light/50 border border-transparent hover:bg-surface-light hover:border-border-light'
                }`}
              >
                <div className="relative flex-shrink-0">
                  {room.type === 'band' ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-sm border-2 border-border-light">
                      🎸
                    </div>
                  ) : (
                    <Avatar name={avatar.name} size="md" online={avatar.online} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground text-sm truncate">{displayName}</span>
                    {room.lastMessage && (
                      <span className="text-xs text-text-muted flex-shrink-0">
                        {formatTime(room.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {room.lastMessage && (
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {room.lastMessage.content}
                    </p>
                  )}
                </div>
                {room.type === 'band' && (
                  <Badge variant="secondary" size="sm">
                    バンド
                  </Badge>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // Chat view component
  const ChatView = () => {
    if (!selectedRoom) {
      return (
        <div className="hidden md:flex h-full items-center justify-center">
          <GlassCard className="text-center py-12 px-8">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-text-muted">チャットルームを選択してください</p>
          </GlassCard>
        </div>
      );
    }

    const isGroupChat = selectedRoom.type === 'band';

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border-light mb-4">
          <button
            onClick={handleBack}
            className="md:hidden p-2 rounded-lg bg-surface-light hover:bg-surface-lighter transition-colors text-text-muted"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-shrink-0">
            {selectedRoom.type === 'band' ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-sm border-2 border-border-light">
                🎸
              </div>
            ) : (
              <Avatar
                name={getRoomAvatar(selectedRoom).name}
                size="md"
                online={getRoomAvatar(selectedRoom).online}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-foreground truncate">{getRoomDisplayName(selectedRoom)}</h2>
            <p className="text-xs text-text-muted">
              {isGroupChat
                ? `${selectedRoom.members.length}人のメンバー`
                : getRoomAvatar(selectedRoom).online
                ? 'オンライン'
                : 'オフライン'}
            </p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
          {roomMessages.map((msg, i) => {
            const isOwn = msg.senderId === user?.id;
            const sender = getUserById(msg.senderId);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <div className="flex-shrink-0 mt-auto">
                    <Avatar name={sender?.name || ''} size="sm" />
                  </div>
                )}
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  {isGroupChat && !isOwn && (
                    <p className="text-xs text-text-muted mb-0.5 ml-1">
                      {sender?.nickname || sender?.name || ''}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-primary/20 border border-primary/30 text-foreground'
                        : 'bg-surface-light border border-border-light text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-xs text-text-muted mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 pt-4 border-t border-border-light mt-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="メッセージを入力..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 rounded-xl bg-surface-light/50 border border-border-light text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 px-4 py-2.5 text-sm"
          />
          <Button
            size="md"
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            送信
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Desktop: side-by-side layout */}
      <div className="hidden md:grid md:grid-cols-[340px_1fr] gap-6 h-[calc(100vh-160px)]">
        <GlassCard className="overflow-hidden flex flex-col">
          <RoomList />
        </GlassCard>
        <GlassCard className="overflow-hidden flex flex-col">
          <ChatView />
        </GlassCard>
      </div>

      {/* Mobile: toggle between room list and chat view */}
      <div className="md:hidden">
        <AnimatePresence mode="wait">
          {!selectedRoomId ? (
            <motion.div
              key="room-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RoomList />
            </motion.div>
          ) : (
            <motion.div
              key="chat-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-[calc(100vh-160px)]"
            >
              <GlassCard className="h-full flex flex-col overflow-hidden">
                <ChatView />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
