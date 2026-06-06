import { create } from 'zustand'

const useDeliveryStore = create((set, get) => ({
  deliveryPartner: JSON.parse(localStorage.getItem('deliveryPartner') || 'null'),
  token:           localStorage.getItem('deliveryToken') || null,
  isLoggedIn:      !!localStorage.getItem('deliveryToken'),

  // ── Login ──────────────────────────────────────────────────────────────────
  loginSuccess: (token, deliveryPartner) => {
    localStorage.setItem('deliveryToken',   token)
    localStorage.setItem('deliveryPartner', JSON.stringify(deliveryPartner))
    set({ token, deliveryPartner, isLoggedIn: true })
  },

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem('deliveryToken')
    localStorage.removeItem('deliveryPartner')
    set({ token: null, deliveryPartner: null, isLoggedIn: false })
  },

  // ── Update profile ─────────────────────────────────────────────────────────
  updateProfile: (data) => {
    const updated = { ...get().deliveryPartner, ...data }
    localStorage.setItem('deliveryPartner', JSON.stringify(updated))
    set({ deliveryPartner: updated })
  },

  // ── Online status ──────────────────────────────────────────────────────────
  setOnlineStatus: (isOnline) => {
    const updated = { ...get().deliveryPartner, isOnline }
    localStorage.setItem('deliveryPartner', JSON.stringify(updated))
    set({ deliveryPartner: updated })
  },
}))

export default useDeliveryStore