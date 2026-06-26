import api from "@/lib/axios";
import { EventsResponse, Event, Category } from "@/types/event.types";

export const eventService = {
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    city?: string;
    categoryId?: string;
    search?: string;
    date?: string;
  }) => {
    const res = await api.get<EventsResponse>("/api/events", { params });
    return res.data;
  },

  getEventById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Event }>(
      `/api/events/${id}`,
    );
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get<{ success: boolean; data: Category[] }>(
      "/api/events/categories",
    );
    return res.data;
  },
};
