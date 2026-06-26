"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { connectDashboardSocket, disconnectDashboardSocket } from "@/lib/socket";
import styles from "./organizer.module.css";

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
        connectDashboardSocket(meRes.data.id);
        setLoading(false);
      } catch {
        router.push("/login");
      }
    };
    init();
    return () => disconnectDashboardSocket();
  }, []);

  if (loading)
    return (
      <div className={styles.loader}>
        <div className={styles.spinner} />
        <div className={styles.text}>
          Đang tải<span className={styles.dots}></span>
        </div>
      </div>
    );

  return <DashboardLayout title="">{children}</DashboardLayout>;
}
