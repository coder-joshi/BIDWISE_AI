import { create } from 'zustand'

export const useUIStore = create((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  processingState: 'idle', // 'idle' | 'processing' | 'completed' | 'failed'
  processingError: '',
  setProcessingState: (state, error = '') => set({ processingState: state, processingError: error }),
  
  notifications: [
    { id: 1, type: 'error', title: 'Fraud Alert Detected', message: 'BID-2026-0843 failed signature check.', read: false },
    { id: 2, type: 'success', title: 'Verification Complete', message: 'BID-2026-0841 scored 94/100.', read: false },
  ],
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
  })),
  clearNotifications: () => set({ notifications: [] }),
  addNotification: (notification) => set((state) => ({
    notifications: [{ id: Date.now(), read: false, ...notification }, ...state.notifications]
  }))
}))
