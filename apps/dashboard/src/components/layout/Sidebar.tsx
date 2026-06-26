"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users,
  BookOpen,
  CheckSquare,
  Tag,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth, isAdmin, isOrganizer } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      router.push("/login");
      toast.success("Đã đăng xuất");
    }
  };

  const organizerLinks = [
    { href: "/", label: "Tổng quan", icon: LayoutDashboard },
    { href: "/organizer/events", label: "Sự kiện", icon: Calendar },
    { href: "/organizer/revenue", label: "Doanh thu", icon: BarChart3 },
  ];

  const adminLinks = [
    { href: "/", label: "Tổng quan", icon: LayoutDashboard },
    { href: "/admin/users", label: "Người dùng", icon: Users },
    { href: "/admin/events", label: "Sự kiện", icon: Calendar },
    { href: "/admin/bookings", label: "Đặt vé", icon: BookOpen },
    {
      href: "/admin/applications",
      label: "Duyệt Organizer",
      icon: CheckSquare,
    },
    { href: "/admin/categories", label: "Danh mục", icon: Tag },
  ];

  const links = isAdmin() ? adminLinks : organizerLinks;

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoInner}>
          <div className={styles.logoIcon}>B</div>
          <div className={styles.logoText}>
            <p>BianEvent</p>
            <p>{isAdmin() ? "Admin Panel" : "Organizer"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.sectionLabel}>Menu</div>
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link}${isActive ? ` ${styles.active}` : ""}`}
            >
              <link.icon size={17} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.fullName}</div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>
        </div>
        <button className={styles.logout} onClick={handleLogout}>
          <LogOut size={15} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
