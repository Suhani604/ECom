import { Server } from 'socket.io'

const onlineUsers = new Map()
const socketUserMap = new Map()

export const emitToUser = (io, userId, event, data) => {
  const ids = [...(onlineUsers.get(userId?.toString()) || [])]
  ids.forEach((sid) => io.to(sid).emit(event, data))
}

export const emitToAdmins = (io, event, data) => {
  io.to('role:admin').emit(event, data)
}

export const getOnlineCount = () => onlineUsers.size

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId
    const role   = socket.handshake.auth?.role || 'buyer'

    if (userId) {
      if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set())
      onlineUsers.get(userId).add(socket.id)
      socketUserMap.set(socket.id, userId)
      socket.join(`role:${role}`)
      socket.join(`user:${userId}`)
      io.to('role:admin').emit('online:count', { count: getOnlineCount() })
    }

    socket.on('disconnect', () => {
      const uid = socketUserMap.get(socket.id)
      if (uid) {
        const sockets = onlineUsers.get(uid)
        if (sockets) {
          sockets.delete(socket.id)
          if (sockets.size === 0) onlineUsers.delete(uid)
        }
        socketUserMap.delete(socket.id)
      }
      io.to('role:admin').emit('online:count', { count: getOnlineCount() })
    })
  })

  console.log('🔌  Socket.io initialised')
  return io
}