"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import LoadingScreen from "@/components/dashboard/LoadingScreen";

export default function HomePage() {
  const { user, setUser, setAccessToken } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const refreshRes = await authService.refresh();
        setAccessToken(refreshRes.accessToken);
        const meRes = await authService.getMe();
        setUser(meRes.data);
        setLoading(false);
      } catch (err) {
        console.log("Error:", err);
        router.push("/login");
      }
    };
    init();
  }, [router, setAccessToken, setUser]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;
  if (user.role === "ADMIN") return <AdminDashboard />;
  if (user.role === "ORGANIZER") return <OrganizerDashboard />;
  return null;
}
