import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('user-storage')
        localStorage.removeItem('persist:user-storage')
        set({ user: null })
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
)
