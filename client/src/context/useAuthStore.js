import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user:       null,
      token:      null,
login: (user, token) => {
  set({ user, token })
  // Cart reload with delay so auth-storage saves first
  setTimeout(() => {
    try {
      const { reloadCart } = require('./useCartStore').default.getState()
      reloadCart()
    } catch {}
  }, 100)
},
logout: () => {
  set({ user: null, token: null })
  setTimeout(() => {
    try {
      const cartStore = require('./useCartStore').default.getState()
      cartStore.reloadCart()
    } catch {}
  }, 100)
},
      updateUser: (partial) => set((s) => ({ user: { ...s.user, ...partial } })),
    }),
    { name: 'auth-storage' }
  )
)

export default useAuthStore