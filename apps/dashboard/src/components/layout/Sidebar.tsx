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
  QrCode,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
    <>
      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 240px;
          background: linear-gradient(180deg, #faf8f5 0%, #f5f1eb 100%);
          border-right: 1px solid #e8e0d5;
          display: flex;
          flex-direction: column;
          z-index: 50;
        }

        .sidebar-logo {
          padding: 20px 20px 16px;
          border-bottom: 1px solid #e8e0d5;
        }

        .sidebar-logo-inner {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-logo-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
          color: #fff;
          box-shadow: 0 2px 8px rgba(184,145,106,0.35);
          flex-shrink: 0;
        }

        .sidebar-logo-text p:first-child {
          font-weight: 700;
          font-size: 14px;
          color: #3d2f1f;
          margin: 0;
          letter-spacing: 0.01em;
        }

        .sidebar-logo-text p:last-child {
          font-size: 11px;
          color: #a89070;
          margin: 0;
          margin-top: 1px;
          font-weight: 500;
        }

        .sidebar-section-label {
          padding: 16px 12px 6px;
          font-size: 10px;
          font-weight: 600;
          color: #c0a888;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: #7d6550;
          text-decoration: none;
          transition: all 0.18s ease;
          position: relative;
          border: 1px solid transparent;
        }

        .sidebar-link:hover {
          background: #ede8e0;
          color: #3d2f1f;
          border-color: #e0d8cc;
          transform: translateX(2px);
        }

        .sidebar-link.active {
          background: #fff;
          color: #8b5e3c;
          border-color: #ddd0be;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          font-weight: 600;
        }

        .sidebar-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 18px;
          background: linear-gradient(180deg, #c8a882, #b8916a);
          border-radius: 0 3px 3px 0;
        }

        .sidebar-link svg {
          flex-shrink: 0;
          opacity: 0.65;
          transition: opacity 0.18s, transform 0.18s;
        }

        .sidebar-link:hover svg {
          opacity: 1;
          transform: scale(1.1);
        }

        .sidebar-link.active svg {
          opacity: 1;
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid #e8e0d5;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid #e8e0d5;
          margin-bottom: 6px;
        }

        .sidebar-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .sidebar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #3d2f1f;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-email {
          font-size: 11px;
          color: #a89070;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #a89070;
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: all 0.18s ease;
        }

        .sidebar-logout:hover {
          background: #fce8e8;
          color: #c0392b;
        }

        .sidebar-logout:hover svg {
          transform: translateX(-2px);
        }

        .sidebar-logout svg {
          transition: transform 0.18s;
        }
      `}</style>

      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-inner">
            <div className="sidebar-logo-icon">B</div>
            <div className="sidebar-logo-text">
              <p>BianEvent</p>
              <p>{isAdmin() ? "Admin Panel" : "Organizer"}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link${isActive ? " active" : ""}`}
              >
                <link.icon size={17} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar-user-name">{user?.fullName}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={15} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}
