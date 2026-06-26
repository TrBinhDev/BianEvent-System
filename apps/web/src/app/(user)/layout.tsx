"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FestivalDecor from "@/components/common/FestivalDecor";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, []);

  if (!isAuthenticated()) return null;

  return (
    <>
      <FestivalDecor />
      <Navbar />
      <main className="min-h-screen relative z-10">{children}</main>
      <Footer />
    </>
  );
}
