import api from "@/lib/axios";
import { LoginResponse, RegisterResponse } from "@/types/auth.types";

export const authService = {
  register: async (data: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    const res = await api.post<RegisterResponse>("/api/auth/register", data);
    return res.data;
  },

  verifyEmail: async (data: { userId: string; otp: string }) => {
    const res = await api.post("/api/auth/verify-email", data);
    return res.data;
  },

  resendOtp: async (userId: string) => {
    const res = await api.post("/api/auth/resend-otp", { userId });
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<LoginResponse>("/api/auth/login", data);
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/api/auth/logout");
    return res.data;
  },

  refresh: async () => {
    const res = await api.post<LoginResponse>("/api/auth/refresh");
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post("/api/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await api.post("/api/auth/reset-password", data);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get("/api/users/me");
    return res.data;
  },

  updateProfile: async (data: { fullName?: string; avatarUrl?: string }) => {
    const res = await api.patch("/api/users/me", data);
    return res.data;
  },

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const res = await api.patch("/api/users/me/password", data);
    return res.data;
  },

  applyOrganizer: async (data: {
    organization: string;
    description?: string;
    contactPhone?: string;
  }) => {
    const res = await api.post("/api/users/me/apply-organizer", data);
    return res.data;
  },
};
