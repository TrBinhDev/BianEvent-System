import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notification.store'
import toast from 'react-hot-toast'

let socket: Socket | null = null

export const connectSocket = (userId: string) => {
  if (socket?.connected) return

  socket = io('http://localhost:3004', {
    withCredentials: true,
  })

  socket.on('connect', () => {
    console.log('Socket connected')
    socket?.emit('join:user', userId)
  })

  socket.on('booking_confirmed', (data: { bookingId: string; eventTitle: string; quantity: number }) => {
    toast.success(`Đặt vé thành công! ${data.quantity} vé cho "${data.eventTitle}"`)
    useNotificationStore.getState().incrementUnread()
  })

  socket.on('booking_failed', (data: { eventTitle: string; reason: string }) => {
    toast.error(`Đặt vé thất bại: ${data.reason}`)
    useNotificationStore.getState().incrementUnread()
  })

  socket.on('new_notification', () => {
    useNotificationStore.getState().incrementUnread()
  })

  socket.on('user_banned', () => {
    toast.error('Tài khoản của bạn đã bị khoá. Bạn sẽ bị đăng xuất.', { duration: 4000 })
    setTimeout(() => {
      disconnectSocket()
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }, 2000)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })
}

export const disconnectSocket = () => {
  socket?.disconnect()
  socket = null
}

export const joinEventRoom = (eventId: string) => {
  socket?.emit('join:event', eventId)
}

export const leaveEventRoom = (eventId: string) => {
  socket?.emit('leave:event', eventId)
}

export const onSlotUpdated = (callback: (data: { eventTitle: string; ticketTypeName: string; quantity: number }) => void) => {
  socket?.on('slot_updated', callback)
}

export const offSlotUpdated = () => {
  socket?.off('slot_updated')
}

export default socket