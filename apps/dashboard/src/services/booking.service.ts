import api from "@/lib/axios";

export const bookingService = {
  // Admin
  getAllBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    eventId?: string;
  }) => {
    const res = await api.get("/api/admin/bookings", { params });
    return res.data;
  },

  getBookingById: async (id: string) => {
    const res = await api.get(`/api/admin/bookings/${id}`);
    return res.data;
  },

  // Checkin
  checkinTicket: async (ticketId: string) => {
    const res = await api.patch(`/api/bookings/tickets/${ticketId}/checkin`);
    return res.data;
  },
};
