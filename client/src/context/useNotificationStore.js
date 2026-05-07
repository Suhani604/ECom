import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notif) =>
        set((state) => ({
          notifications: [
            {
              id:   Date.now() + Math.random(),
              read: false,
              time: new Date().toISOString(),
              ...notif,
            },
            ...state.notifications,
          ].slice(0, 100),
        })),

      markRead:    (id) => set((s) => ({
        notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      })),

      markAllRead: () => set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true }))
      })),

      clearAll: () => set({ notifications: [] }),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'notifications-storage' }
  )
)

export default useNotificationStore