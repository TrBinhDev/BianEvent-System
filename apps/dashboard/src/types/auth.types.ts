export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: "USER" | "ORGANIZER" | "ADMIN";
  status: "UNVERIFIED" | "ACTIVE" | "BANNED";
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
}
