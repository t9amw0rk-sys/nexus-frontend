import { useSyncExternalStore } from "react";
import { notificationsApi } from "./api";

export type Notification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  taskId?: string | null;
  fromUser?: { id: string; fullName: string; avatarUrl: string | null } | null;
};

let items: Notification[] = [];
let loaded = false;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export const notifStore = {
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  get() { return items; },
  reset() { items = []; loaded = false; emit(); },

  async load() {
    if (loaded) return;
    try {
      const res = await notificationsApi.getAll();
      items = res.data.data ?? [];
      loaded = true;
      emit();
    } catch {}
  },

  async markAllRead() {
    try {
      await notificationsApi.markAllAsRead();
      items = items.map((n) => ({ ...n, isRead: true }));
      emit();
    } catch {}
  },

  async markRead(id: string) {
    try {
      await notificationsApi.markAsRead(id);
      items = items.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      emit();
    } catch {}
  },

  async remove(id: string) {
    try {
      await notificationsApi.delete(id);
      items = items.filter((n) => n.id !== id);
      emit();
    } catch {}
  },
};

export function useNotifications(): Notification[] {
  return useSyncExternalStore(notifStore.subscribe, notifStore.get, notifStore.get);
}

export function useUnreadCount(): number {
  return useNotifications().filter((n) => !n.isRead).length;
}
