"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import DashboardLayout from "@/components/layout/DashboardLayout";
import styles from "./admin.module.css";

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
      <div className={styles.authChecking}>
        <div className={styles.spinnerWrap}>
          <div className={styles.spinnerTrack} />
          <div className={styles.spinner} />
        </div>
        <p className={styles.authText}>Đang xác thực...</p>
      </div>
    );
  }

  return <DashboardLayout title="">{children}</DashboardLayout>;
}
