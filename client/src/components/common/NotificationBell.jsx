import { useState } from 'react'
import { FiBell, FiCheck, FiTrash2, FiX } from 'react-icons/fi'
import useNotificationStore from '../../context/useNotificationStore.js'

// ─── Icon per notification type ───────────────────────────────────────────────
const typeIcon = {
  order_new:    '🛒',
  order:        '📦',
  payment:      '✅',
  payment_failed:'❌',
  return:       '↩️',
  product:      '🏷️',
  stock:        '⚠️',
  payout:       '💰',
  account:      '🎉',
  user_online:  '🟢',
  user_offline: '🔴',
}

const typeColor = {
  order_new:     'bg-blue-50 border-blue-200',
  order:         'bg-indigo-50 border-indigo-200',
  payment:       'bg-green-50 border-green-200',
  payment_failed:'bg-red-50 border-red-200',
  return:        'bg-yellow-50 border-yellow-200',
  product:       'bg-pink-50 border-pink-200',
  stock:         'bg-orange-50 border-orange-200',
  payout:        'bg-emerald-50 border-emerald-200',
  account:       'bg-purple-50 border-purple-200',
}

// ─── NotificationBell ─────────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, markRead, markAllRead, clearAll, unreadCount } =
    useNotificationStore()

  const count = unreadCount()

  const formatTime = (iso) => {
    const d   = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60)   return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <FiBell size={20} className="text-gray-600" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-pink-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-sm text-gray-800">
              Notifications
              {count > 0 && (
                <span className="ml-2 text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                  {count} new
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                  title="Mark all read"
                >
                  <FiCheck size={12} /> All read
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                title="Clear all"
              >
                <FiTrash2 size={12} />
              </button>
              <button onClick={() => setOpen(false)}>
                <FiX size={14} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !n.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <span className="text-lg mt-0.5 flex-shrink-0">
                    {typeIcon[n.type] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(n.time)}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 bg-pink-400 rounded-full mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell