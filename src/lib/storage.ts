'use client';

import { STORAGE_PREFIX } from './constants';

function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(getKey(key));
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(getKey(key), JSON.stringify(value));
      // Cross-tab sync via storage event (automatic in browsers)
    } catch {
      console.warn('Failed to save to localStorage');
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getKey(key));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
  },
};
