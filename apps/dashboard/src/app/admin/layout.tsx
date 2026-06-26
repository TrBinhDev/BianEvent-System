"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, setUser, user } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }
      if (!user) {
        const res = await authService.getMe();
        setUser(res.data);
        if (res.data.role !== "ADMIN") router.push("/login");
        else setChecking(false);
        return;
      }
      if (!isAdmin()) {
        router.push("/login");
        return;
      }
      setChecking(false);
    };

    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking || !isAuthenticated() || !user) {
    return (
      <>
        <style>{`
          .auth-checking {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f5f1eb;
            gap: 14px;
          }

          .auth-checking-spinner-wrap {
            position: relative;
            width: 34px;
            height: 34px;
          }

          .auth-checking-track {
            position: absolute;
            inset: 0;
            border: 2.5px solid #e8e0d5;
            border-radius: 50%;
          }

          .auth-checking-spin {
            position: absolute;
            inset: 0;
            border: 2.5px solid transparent;
            border-top-color: #b8916a;
            border-radius: 50%;
            animation: auth-spin 0.8s linear infinite;
          }

          @keyframes auth-spin {
            to { transform: rotate(360deg); }
          }

          .auth-checking-text {
            font-size: 13px;
            font-weight: 500;
            color: #c0a888;
            animation: auth-pulse 2s ease-in-out infinite;
          }

          @keyframes auth-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.45; }
          }
        `}</style>
        <div className="auth-checking">
          <div className="auth-checking-spinner-wrap">
            <div className="auth-checking-track" />
            <div className="auth-checking-spin" />
          </div>
          <p className="auth-checking-text">Đang xác thực...</p>
        </div>
      </>
    );
  }

  return <DashboardLayout title="">{children}</DashboardLayout>;
}
