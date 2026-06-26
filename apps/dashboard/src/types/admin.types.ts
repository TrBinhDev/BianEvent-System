export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: "USER" | "ORGANIZER" | "ADMIN";
  status: "UNVERIFIED" | "ACTIVE" | "BANNED";
  createdAt: string;
  organizerApplication?: OrganizerApplication;
}

export interface OrganizerApplication {
  id: string;
  userId: string;
  organization: string;
  description: string | null;
  contactPhone: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface UsersResponse {
  success: boolean;
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApplicationsResponse {
  success: boolean;
  data: OrganizerApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
