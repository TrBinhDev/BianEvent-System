import api from "@/lib/axios";

export const adminService = {
  // Users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
  }) => {
    const res = await api.get("/api/admin/users", { params });
    return res.data;
  },

  getUserById: async (id: string) => {
    const res = await api.get(`/api/admin/users/${id}`);
    return res.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const res = await api.patch(`/api/admin/users/${id}/role`, { role });
    return res.data;
  },

  updateUserStatus: async (id: string, status: string) => {
    const res = await api.patch(`/api/admin/users/${id}/status`, { status });
    return res.data;
  },

  // Organizer applications
  getApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const res = await api.get("/api/admin/organizer-applications", { params });
    return res.data;
  },

  approveApplication: async (id: string) => {
    const res = await api.patch(
      `/api/admin/organizer-applications/${id}/approve`,
    );
    return res.data;
  },

  rejectApplication: async (id: string) => {
    const res = await api.patch(
      `/api/admin/organizer-applications/${id}/reject`,
    );
    return res.data;
  },
};
