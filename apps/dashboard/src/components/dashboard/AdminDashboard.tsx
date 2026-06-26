/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { eventService } from "@/services/event.service";
import { bookingService } from "@/services/booking.service";
import {
  Users,
  Calendar,
  Ticket,
  CheckSquare,
  ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalBookings: 0,
    pendingApplications: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, events, bookings, apps] = await Promise.all([
          adminService.getUsers({ limit: 1 }),
          eventService.getAllEvents({ limit: 1 }),
          bookingService.getAllBookings({ limit: 5 }),
          adminService.getApplications({ status: "PENDING", limit: 1 }),
        ]);

        setStats({
          totalUsers: users.pagination?.total || 0,
          totalEvents: events.pagination?.total || 0,
          totalBookings: bookings.pagination?.total || 0,
          pendingApplications: apps.pagination?.total || 0,
        });

        const bookingRes = await bookingService.getAllBookings({ limit: 5 });
        setRecentBookings(bookingRes.data || []);

        const eventRes = await eventService.getAllEvents({ limit: 5 });
        setRecentEvents(eventRes.data || []);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    {
      label: "Người dùng",
      count: stats.totalUsers,
      icon: Users,
      iconBg: "#e8f0fa",
      iconColor: "#4a7cc9",
      href: "/admin/users",
    },
    {
      label: "Sự kiện",
      count: stats.totalEvents,
      icon: Calendar,
      iconBg: "#e8f5ef",
      iconColor: "#3a9e70",
      href: "/admin/events",
    },
    {
      label: "Đặt vé",
      count: stats.totalBookings,
      icon: Ticket,
      iconBg: "#f0e8fa",
      iconColor: "#8a5cc9",
      href: "/admin/bookings",
    },
    {
      label: "Yêu cầu duyệt",
      count: stats.pendingApplications,
      icon: CheckSquare,
      iconBg: "#faf0e0",
      iconColor: "#c9883a",
      href: "/admin/applications",
    },
  ];

  return (
    <DashboardLayout title="Tổng quan hệ thống">
      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : (
        <>
          <div className={styles.grid4}>
            {cards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className={styles.statCard}
              >
                <div className={styles.statCardTop}>
                  <div
                    className={styles.statIcon}
                    style={{ background: card.iconBg }}
                  >
                    <card.icon size={20} color={card.iconColor} />
                  </div>
                </div>
                <div className={styles.statCount}>{card.count}</div>
                <div className={styles.statLabel}>
                  {card.label}
                  <ArrowUpRight size={13} className={styles.statArrow} />
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.grid2}>
            {/* Recent Bookings */}
            <div className={styles.listCard}>
              <div className={styles.listCardHeader}>
                <span className={styles.listCardTitle}>
                  <Ticket size={16} />
                  Đặt vé gần đây
                </span>
                <Link href="/admin/bookings" className={styles.listCardLink}>
                  Xem tất cả
                </Link>
              </div>
              {recentBookings.length === 0 ? (
                <div className={styles.emptyText}>Chưa có đặt vé nào</div>
              ) : (
                recentBookings.map((booking: any) => (
                  <div key={booking.id} className={styles.listItem}>
                    <div className={styles.listItemLeft}>
                      <span className={styles.listItemTitle}>
                        #{booking.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={styles.listItemSub}>
                        {booking.quantity} vé ·{" "}
                        {Number(booking.totalAmount).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className={styles.listItemRight}>
                      <span
                        className={`${styles.badgeStatus} ${
                          booking.status === "CONFIRMED"
                            ? styles.badgeConfirmed
                            : booking.status === "PENDING"
                              ? styles.badgePending
                              : ""
                        }`}
                      >
                        {booking.status === "CONFIRMED"
                          ? "Thành công"
                          : booking.status === "PENDING"
                            ? "Chờ xử lý"
                            : booking.status || "Khác"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Events */}
            <div className={styles.listCard}>
              <div className={styles.listCardHeader}>
                <span className={styles.listCardTitle}>
                  <Calendar size={16} />
                  Sự kiện mới nhất
                </span>
                <Link href="/admin/events" className={styles.listCardLink}>
                  Xem tất cả
                </Link>
              </div>
              {recentEvents.length === 0 ? (
                <div className={styles.emptyText}>Chưa có sự kiện nào</div>
              ) : (
                recentEvents.map((event: any) => (
                  <div key={event.id} className={styles.listItem}>
                    <div className={styles.listItemLeft}>
                      <span className={styles.listItemTitle}>
                        {event.title}
                      </span>
                      <span className={styles.listItemSub}>
                        {event.city} · {event.venueName}
                      </span>
                    </div>
                    <div className={styles.listItemRight}>
                      <span
                        className={`${styles.badgeStatus} ${
                          event.status === "PUBLISHED"
                            ? styles.badgePublished
                            : event.status === "DRAFT"
                              ? styles.badgeDraft
                              : ""
                        }`}
                      >
                        {event.status === "PUBLISHED"
                          ? "Đang bán"
                          : event.status === "DRAFT"
                            ? "Nháp"
                            : event.status || "Khác"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
