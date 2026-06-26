import api from "@/lib/axios";

export const authService = {
  login: async (data: { email: string; password: string }) => {
    const res = await api.post("/api/auth/login", data);
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/api/auth/logout");
    return res.data;
  },

  getMe: async () => {
    const res = await api.get("/api/users/me");
    return res.data;
  },
  refresh: async () => {
    const res = await api.post("/api/auth/refresh");
    return res.data;
  },
};
