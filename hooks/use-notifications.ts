"use client";

import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";

export interface Notification {
  id: string;
  type: string;
  post_id?: string;
  actor_id: string;
  message: string;
  read: boolean;
  created_at: number;
}

export function useNotifications() {
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const notifRef = ref(database, `notifications/${user.uid}`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const list: Notification[] = Object.entries(data)
        .map(([id, val]) => ({ id, ...(val as Omit<Notification, "id">) }))
        .sort((a, b) => b.created_at - a.created_at);

      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    const notifRef = ref(database, `notifications/${user.uid}/${notificationId}`);
    await update(notifRef, { read: true });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const updates: Record<string, boolean> = {};
    notifications.filter((n) => !n.read).forEach((n) => {
      updates[`notifications/${user.uid}/${n.id}/read`] = true;
    });
    if (Object.keys(updates).length > 0) {
      const dbRef = ref(database);
      await update(dbRef, updates);
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
