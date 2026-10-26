import { create } from 'zustand'

export const useUIStore = create((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectedBidId: null,
  setSelectedBidId: (bidId) => set({ selectedBidId: bidId }),

  chatWidgetOpen: false,
  setChatWidgetOpen: (open) => set({ chatWidgetOpen: open }),

  processingState: 'idle', // 'idle' | 'processing' | 'completed' | 'failed'
  processingError: '',
  setProcessingState: (state, error = '') => set({ processingState: state, processingError: error }),

  readNotificationIds: [],
  markAsRead: (id) =>
    set((state) => ({
      readNotificationIds: state.readNotificationIds.includes(id)
        ? state.readNotificationIds
        : [...state.readNotificationIds, id],
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllAsRead: (allIds = []) =>
    set((state) => ({
      readNotificationIds: Array.from(
        new Set([...state.readNotificationIds, ...allIds, ...state.notifications.map((n) => n.id)])
      ),
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  notifications: [],
  clearNotifications: () => set({ notifications: [] }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [{ id: Date.now(), read: false, ...notification }, ...state.notifications],
    })),
}))
