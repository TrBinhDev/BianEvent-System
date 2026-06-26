/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const eventService = {
  // Organizer
  getMyEvents: async (status?: string) => {
    const res = await api.get("/api/organizer/events", {
      params: { status },
    });
    return res.data;
  },

  getMyEventById: async (id: string) => {
    const res = await api.get(`/api/organizer/events/${id}`);
    return res.data;
  },

  createEvent: async (data: any) => {
    const res = await api.post("/api/organizer/events", data);
    return res.data;
  },

  updateEvent: async (id: string, data: any) => {
    const res = await api.patch(`/api/organizer/events/${id}`, data);
    return res.data;
  },

  updateEventStatus: async (id: string, status: string) => {
    const res = await api.patch(`/api/organizer/events/${id}/status`, {
      status,
    });
    return res.data;
  },

  deleteEvent: async (id: string) => {
    const res = await api.delete(`/api/organizer/events/${id}`);
    return res.data;
  },

  uploadCover: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/api/organizer/events/${id}/cover`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  uploadImages: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const res = await api.post(`/api/organizer/events/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  deleteImage: async (eventId: string, imageId: string) => {
    const res = await api.delete(
      `/api/organizer/events/${eventId}/images/${imageId}`,
    );
    return res.data;
  },

  uploadSeatingMap: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(
      `/api/organizer/events/${id}/seating-map`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  getEventStats: async (id: string) => {
    const res = await api.get(`/api/organizer/events/${id}/stats`);
    return res.data;
  },

  // Ticket types
  createTicketType: async (eventId: string, data: any) => {
    const res = await api.post(
      `/api/organizer/events/${eventId}/ticket-types`,
      data,
    );
    return res.data;
  },

  updateTicketType: async (eventId: string, typeId: string, data: any) => {
    const res = await api.patch(
      `/api/organizer/events/${eventId}/ticket-types/${typeId}`,
      data,
    );
    return res.data;
  },

  deleteTicketType: async (eventId: string, typeId: string) => {
    const res = await api.delete(
      `/api/organizer/events/${eventId}/ticket-types/${typeId}`,
    );
    return res.data;
  },

  // Public categories
  getCategories: async () => {
    const res = await api.get("/api/events/categories");
    return res.data;
  },

  // Admin
  getAllEvents: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const res = await api.get("/api/admin/events", { params });
    return res.data;
  },

  adminUpdateEventStatus: async (id: string, status: string) => {
    const res = await api.patch(`/api/admin/events/${id}/status`, { status });
    return res.data;
  },

  // Admin categories
  adminGetCategories: async () => {
    const res = await api.get("/api/admin/categories");
    return res.data;
  },

  adminCreateCategory: async (name: string) => {
    const res = await api.post("/api/admin/categories", { name });
    return res.data;
  },

  adminUpdateCategory: async (id: string, name: string) => {
    const res = await api.patch(`/api/admin/categories/${id}`, { name });
    return res.data;
  },

  adminDeleteCategory: async (id: string) => {
    const res = await api.delete(`/api/admin/categories/${id}`);
    return res.data;
  },
};
