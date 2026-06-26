"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const refreshRes = await authService.refresh();
        setAccessToken(refreshRes.accessToken);
        const meRes = await authService.getMe();
        setUser(meRes.data);
        if (meRes.data.role !== "ORGANIZER") {
          router.push("/login");
          return;
        }
        setLoading(false);
      } catch {
        router.push("/login");
      }
    };
    init();
  }, []);

  if (loading)
    return (
      <>
        <style>{`
          .org-loader {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #faf8f5;
          }

          .org-loader-spinner {
            width: 44px;
            height: 44px;
            border: 3px solid #e8e0d5;
            border-top-color: #c8a882;
            border-radius: 50%;
            animation: org-spin 0.8s linear infinite;
          }

          @keyframes org-spin {
            to { transform: rotate(360deg); }
          }

          .org-loader-text {
            margin-top: 16px;
            font-size: 14px;
            font-weight: 500;
            color: #c0a888;
            letter-spacing: 0.03em;
          }

          .org-loader-dots::after {
            content: '';
            animation: dots 1.4s steps(4, end) infinite;
          }

          @keyframes dots {
            0%   { content: ''; }
            25%  { content: '.'; }
            50%  { content: '..'; }
            75%  { content: '...'; }
            100% { content: ''; }
          }
        `}</style>
        <div className="org-loader">
          <div className="org-loader-spinner" />
          <div className="org-loader-text">
            Đang tải<span className="org-loader-dots"></span>
          </div>
        </div>
      </>
    );

  return <DashboardLayout title="">{children}</DashboardLayout>;
}
