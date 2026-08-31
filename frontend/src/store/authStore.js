import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAccessToken: (token) => set({ accessToken: token }),

      login: async ({ email, password }) => {
        const { data } = await api.post('/auth/login', { email, password })
        set({
          user: data.data.user,
          accessToken: data.data.accessToken,
          isAuthenticated: true,
        })
        return data.data.user
      },

      logout: async () => {
        try { await api.post('/auth/logout') } catch { /* ignore */ }
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      getMe: async () => {
        const { data } = await api.get('/auth/me')
        set({ user: data.data, isAuthenticated: true })
        return data.data
      },
    }),
    {
      name: 'gem-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
