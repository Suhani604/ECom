import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── useCartStore ─────────────────────────────────────────────────────────────
// Manages cart items locally (localStorage) until checkout
// Each item: { productId, title, image, size, color, quantity, price, mrp, sellerId }

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Add item or increase quantity if same product+size+color
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.size === item.size && i.color === item.color
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] }
        })
      },

      // Remove item
      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size && i.color === color)
          ),
        }))
      },

      // Update quantity
      updateQuantity: (productId, size, color, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, size, color)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      // Clear entire cart
      clearCart: () => set({ items: [] }),

      // Computed getters
      totalItems:  () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalMRP:    () => get().items.reduce((sum, i) => sum + i.mrp   * i.quantity, 0),
      totalSavings:() => get().totalMRP() - get().totalAmount(),
    }),
    {
      name: 'cart-storage',
      partialize: (s) => ({ items: s.items }),
    }
  )
)

export default useCartStore