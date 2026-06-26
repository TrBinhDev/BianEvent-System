"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Ticket, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { authService } from "@/services/auth.service";
import { notificationService } from "@/services/notification.service";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import toast from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const {
    user,
    accessToken,
    setUser,
    setAccessToken,
    clearAuth,
    isAuthenticated,
  } = useAuthStore();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (accessToken && !user) {
      authService.getMe().then((res) => {
        setUser(res.data);
        connectSocket(res.data.id);
      });
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated()) {
      notificationService.getUnreadCount().then((res) => {
        setUnreadCount(res.count);
      });
    }
  }, [accessToken]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      disconnectSocket();
      router.push("/");
      toast.success("Đã đăng xuất");
    }
  };

  const handleProtectedNav = (href: string) => {
    if (!isAuthenticated()) {
      router.push(`/login?redirect=${href}`);
      return;
    }
    router.push(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--color-cream)]/90 backdrop-blur-md border-b border-[var(--color-cream-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">B</span>
            </div>
            <span className="font-bold text-xl">
              <span className="text-[var(--color-text)]">Bian</span>
              <span className="text-[var(--color-primary)]">Event</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/events"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors font-medium"
            >
              Khám phá
            </Link>
            <button
              onClick={() => handleProtectedNav("/bookings")}
              className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors font-medium"
            >
              <Ticket size={16} />
              Vé của tôi
            </button>
            <button
              onClick={() => handleProtectedNav("/notifications")}
              className="relative flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors font-medium"
            >
              <Bell size={16} />
              Thông báo
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-3 bg-[var(--color-primary)] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated() ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleProtectedNav("/profile")}
                  className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <div className="w-8 h-8 bg-[var(--color-cream-dark)] rounded-full flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <span className="font-medium text-sm">{user?.fullName}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] transition-all"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-[var(--color-text)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--color-cream)] border-t border-[var(--color-cream-dark)] px-4 py-4 flex flex-col gap-4">
          <Link href="/events" className="font-medium text-[var(--color-text)]">
            Khám phá
          </Link>
          <button
            onClick={() => handleProtectedNav("/bookings")}
            className="text-left font-medium text-[var(--color-text)]"
          >
            Vé của tôi
          </button>
          <button
            onClick={() => handleProtectedNav("/notifications")}
            className="text-left font-medium text-[var(--color-text)]"
          >
            Thông báo {unreadCount > 0 && `(${unreadCount})`}
          </button>
          {isAuthenticated() ? (
            <>
              <button
                onClick={() => handleProtectedNav("/profile")}
                className="text-left font-medium text-[var(--color-text)]"
              >
                Tài khoản
              </button>
              <button
                onClick={handleLogout}
                className="text-left text-[var(--color-primary)] font-medium"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="flex-1 text-center py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-full font-medium"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="flex-1 text-center py-2 bg-[var(--color-primary)] text-white rounded-full font-medium"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
