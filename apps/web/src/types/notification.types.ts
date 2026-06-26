export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_FAILED'
  | 'EVENT_CANCELLED'
  | 'ORGANIZER_APPROVED'

export interface Notification {
  id: string
  userId: string
  title: string
  body: string | null
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export interface NotificationsResponse {
  success: boolean
  data: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}