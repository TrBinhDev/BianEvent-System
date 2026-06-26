export interface Ticket {
  id: string
  status: 'ACTIVE' | 'USED' | 'CANCELLED'
  createdAt: string
}

export interface StatusLog {
  id: string
  fromStatus: string | null
  toStatus: string
  reason: string | null
  createdAt: string
}

export interface Booking {
  id: string
  userId: string
  eventId: string
  ticketTypeId: string
  quantity: number
  totalAmount: string
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED'
  paymentStatus: 'UNPAID' | 'PAID'
  createdAt: string
  updatedAt: string
  tickets: Ticket[]
  statusLogs?: StatusLog[]
}

export interface BookingsResponse {
  success: boolean
  data: Booking[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}