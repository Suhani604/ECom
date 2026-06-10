import { create } from 'zustand'

// ─── Helper: get cart key for current user ────────────────────────────────────
function getCartKey() {
  try {
    const auth = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const userId = auth?.state?.user?._id
    return userId ? `cart-${userId}` : 'cart-guest'
  } catch {
    return 'cart-guest'
  }
}

// ─── Helper: load cart from localStorage ─────────────────────────────────────
function loadCart() {
  try {
    const key  = getCartKey()
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// ─── Helper: save cart to localStorage ───────────────────────────────────────
function saveCart(items) {
  try {
    const key = getCartKey()
    localStorage.setItem(key, JSON.stringify(items))
  } catch {}
}

// ─── useCartStore ─────────────────────────────────────────────────────────────
const useCartStore = create((set, get) => ({
  items: loadCart(),

  // Reload cart for current user (call on login/logout)
  reloadCart: () => {
    set({ items: loadCart() })
  },

  // Add item or increase quantity if same product+size+color
  addItem: (item) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
      )
      let newItems
      if (existing) {
        newItems = state.items.map((i) =>
          i.productId === item.productId && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        )
      } else {
        newItems = [...state.items, { ...item, quantity: item.quantity || 1 }]
      }
      saveCart(newItems)
      return { items: newItems }
    })
  },

  // Remove item
  removeItem: (productId, size, color) => {
    set((state) => {
      const newItems = state.items.filter(
        (i) => !(i.productId === productId && i.size === size && i.color === color)
      )
      saveCart(newItems)
      return { items: newItems }
    })
  },

  // Update quantity
  updateQuantity: (productId, size, color, quantity) => {
    if (quantity < 1) {
      get().removeItem(productId, size, color)
      return
    }
    set((state) => {
      const newItems = state.items.map((i) =>
        i.productId === productId && i.size === size && i.color === color
          ? { ...i, quantity }
          : i
      )
      saveCart(newItems)
      return { items: newItems }
    })
  },

  // Clear entire cart
  clearCart: () => {
    saveCart([])
    set({ items: [] })
  },

  // Computed getters
  totalItems:   () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalAmount:  () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  totalMRP:     () => get().items.reduce((sum, i) => sum + i.mrp   * i.quantity, 0),
  totalSavings: () => get().totalMRP() - get().totalAmount(),
}))

export default useCartStore