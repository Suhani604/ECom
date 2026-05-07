import { io } from 'socket.io-client'

let socket = null

export const connectSocket = (token) => {
  if (socket?.connected) return socket

  socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
  })

  socket.on('connect', () => console.log('Socket connected:', socket.id))
  socket.on('disconnect', (r) => console.log('Socket disconnected:', r))

  return socket
}

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null }
}

export const getSocket = () => socket