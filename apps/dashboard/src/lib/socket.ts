import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth.store'
import toast from 'react-hot-toast'

let socket: Socket | null = null

export const connectDashboardSocket = (userId: string) => {
  if (socket?.connected) return

  socket = io('http://localhost:3004', {
    withCredentials: true,
  })

  socket.on('connect', () => {
    console.log('Dashboard socket connected')
    socket?.emit('join:user', userId)
  })

  socket.on('ticket_sold', (data: { eventTitle: string; ticketTypeName: string; quantity: number }) => {
    toast.success(`Có người vừa mua ${data.quantity} vé "${data.ticketTypeName}" cho "${data.eventTitle}"`, {
      duration: 5000,
      icon: '🎟️',
    })
  })

  socket.on('event_published', (data: { title: string }) => {
    toast.success(`Sự kiện "${data.title}" đã được publish thành công!`, { duration: 4000 })
  })

  socket.on('user_banned', () => {
    toast.error('Tài khoản của bạn đã bị khoá.', { duration: 4000 })
    setTimeout(() => {
      disconnectDashboardSocket()
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }, 2000)
  })

  socket.on('disconnect', () => {
    console.log('Dashboard socket disconnected')
  })
}

export const disconnectDashboardSocket = () => {
  socket?.disconnect()
  socket = null
}

export const joinEventRoomDashboard = (eventId: string) => {
  socket?.emit('join:event', eventId)
}

export const leaveEventRoomDashboard = (eventId: string) => {
  socket?.emit('leave:event', eventId)
}

export const onTicketSold = (callback: (data: { eventTitle: string; ticketTypeName: string; quantity: number }) => void) => {
  socket?.on('slot_updated', callback)
}

export const offTicketSold = () => {
  socket?.off('slot_updated')
}

export default socket
