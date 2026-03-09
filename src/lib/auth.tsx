'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from './types';
import { storage } from './storage';
import { mockUsers } from '@/data/mockUsers';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  updateUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function getUsers(): User[] {
  const stored = storage.get<User[]>('users');
  if (!stored || stored.length === 0) {
    storage.set('users', mockUsers);
    return mockUsers;
  }
  return stored;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = storage.get<User>('currentUser');
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
    }
    const updated = { ...found, lastLoginAt: new Date().toISOString(), isOnline: true };
    storage.set('currentUser', updated);
    const allUsers = users.map((u) => (u.id === updated.id ? updated : u));
    storage.set('users', allUsers);
    setUser(updated);
    return { success: true };
  }, []);

  const register = useCallback(async (userData: Partial<User>) => {
    const users = getUsers();
    if (users.find((u) => u.email === userData.email)) {
      return { success: false, error: 'このメールアドレスは既に登録されています' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email || '',
      password: userData.password || '',
      name: userData.name || '',
      nickname: userData.nickname || '',
      avatar: '',
      bio: userData.bio || '',
      prefecture: userData.prefecture || '',
      city: userData.city || '',
      instruments: userData.instruments || [],
      genres: userData.genres || [],
      schedule: userData.schedule || [],
      influences: userData.influences || [],
      isAdmin: false,
      subscription: 'free',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isOnline: true,
    };
    const updatedUsers = [...users, newUser];
    storage.set('users', updatedUsers);
    storage.set('currentUser', newUser);
    setUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    if (user) {
      const users = getUsers();
      const updated = users.map((u) => (u.id === user.id ? { ...u, isOnline: false } : u));
      storage.set('users', updated);
    }
    storage.remove('currentUser');
    setUser(null);
  }, [user]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      storage.set('currentUser', updated);
      const users = getUsers();
      storage.set('users', users.map((u) => (u.id === updated.id ? updated : u)));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
