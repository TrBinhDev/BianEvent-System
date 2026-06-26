export interface Category {
  id: string
  name: string
  slug: string
  createdAt: string
}

export interface TicketType {
  id: string
  name: string
  description: string | null
  price: string
  totalSlots: number
  availableSlots: number
  zone: string | null
}

export interface EventImage {
  id: string
  url: string
  order: number
}

export interface Event {
  id: string
  organizerId: string
  categoryId: string | null
  title: string
  description: string | null
  coverUrl: string | null
  seatingMapUrl: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
  venueName: string
  address: string
  city: string
  lat: number | null
  lng: number | null
  startAt: string
  endAt: string
  saleStartAt: string
  saleEndAt: string
  createdAt: string
  updatedAt: string
  category: Category | null
  images?: EventImage[]
  ticketTypes: TicketType[]
}

export interface EventsResponse {
  success: boolean
  data: Event[]
  pagination: Pagination
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}