import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // array of product objects

      addItem: (product) => {
        const exists = get().items.find(i => i._id === product._id)
        if (!exists) {
          set({ items: [...get().items, product] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i._id !== productId) })
      },

      toggleItem: (product) => {
        const exists = get().items.find(i => i._id === product._id)
        if (exists) {
          set({ items: get().items.filter(i => i._id !== product._id) })
        } else {
          set({ items: [...get().items, product] })
        }
      },

      isWishlisted: (productId) => {
        return !!get().items.find(i => i._id === productId)
      },

      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'wishlist-storage' }
  )
)

export default useWishlistStore