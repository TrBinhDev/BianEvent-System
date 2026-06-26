import api from "@/lib/axios";
import { BookingsResponse, Booking } from "@/types/booking.types";

export const bookingService = {
  createBooking: async (data: { ticketTypeId: string; quantity: number }) => {
    const res = await api.post("/api/bookings", data);
    return res.data;
  },

  getMyBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const res = await api.get<BookingsResponse>("/api/bookings/my", { params });
    return res.data;
  },

  getMyBookingById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Booking }>(
      `/api/bookings/my/${id}`,
    );
    return res.data;
  },
};
