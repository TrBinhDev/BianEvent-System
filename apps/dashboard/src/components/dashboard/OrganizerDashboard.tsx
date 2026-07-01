/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { eventService } from "@/services/event.service";
import { Calendar, Ticket, TrendingUp, Clock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import styles from "./OrganizerDashboard.module.css";

export default function OrganizerDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await eventService.getMyEvents();
        const events = eventsRes.data || [];

        let totalBookings = 0;
        let totalRevenue = 0;

        const now = new Date();
        const upcoming = events
          .filter(
            (e: any) => new Date(e.startAt) > now && e.status === "PUBLISHED",
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
          )
          .slice(0, 5);

        await Promise.all(
          events.map(async (event: any) => {
            try {
              const statsRes = await eventService.getEventStats(event.id);
              const stats = statsRes.data;
              totalBookings +=
                stats.ticketTypes?.reduce(
                  (sum: number, t: any) => sum + t.soldSlots,
                  0,
                ) || 0;
              totalRevenue += stats.totalRevenue || 0;
            } catch (err) {
              console.error(`Failed to get stats for event ${event.id}`);
            }
          }),
        );

        setStats({
          totalEvents: events.length,
          totalBookings,
          totalRevenue,
        });

        setUpcomingEvents(upcoming);
      } catch (err) {
        console.error("Failed to fetch organizer stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    {
      label: "Sự kiện của tôi",
      count: stats.totalEvents,
      icon: Calendar,
      iconBg: "#e8f5ef",
      iconColor: "#3a9e70",
      href: "/organizer/events",
    },
    {
      label: "Tổng vé bán ra",
      count: stats.totalBookings,
      icon: Ticket,
      iconBg: "#f0e8fa",
      iconColor: "#8a5cc9",
      href: "/organizer/events",
    },
    {
      label: "Doanh thu",
      count: stats.totalRevenue.toLocaleString("vi-VN") + "đ",
      icon: TrendingUp,
      iconBg: "#e8f0fa",
      iconColor: "#4a7cc9",
      href: "/organizer/events",
    },
  ];

  return (
    <DashboardLayout title="Tổng quan Ban tổ chức">
      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : (
        <>
          <div className={styles.grid3}>
            {cards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className={styles.orgCard}
              >
                <div className={styles.orgCardInner}>
                  <div className={styles.orgCardBody}>
                    <div className={styles.orgCardLabel}>{card.label}</div>
                    <div className={styles.orgCardCount}>{card.count}</div>
                  </div>
                  <div
                    className={styles.orgIcon}
                    style={{ background: card.iconBg }}
                  >
                    <card.icon size={22} color={card.iconColor} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.grid2}>
            <div className={styles.listCard}>
              <div className={styles.listCardHeader}>
                <span className={styles.listCardTitle}>
                  <Clock size={16} />
                  Sự kiện sắp diễn ra
                </span>
                <Link href="/organizer/events" className={styles.listCardLink}>
                  Xem tất cả
                </Link>
              </div>
              {upcomingEvents.length === 0 ? (
                <div className={styles.emptyText}>
                  Không có sự kiện sắp diễn ra
                </div>
              ) : (
                upcomingEvents.map((event: any) => (
                  <div key={event.id} className={styles.listItem}>
                    <div className={styles.listItemLeft}>
                      <span className={styles.listItemTitle}>
                        {event.title}
                      </span>
                      <span className={styles.listItemSub}>
                        {format(new Date(event.startAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </span>
                    </div>
                    <div className={styles.listItemRight}>
                      <span className={styles.badgeUpcoming}>Sắp diễn ra</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.listCard}>
              <div className={styles.listCardHeader}>
                <span className={styles.listCardTitle}>
                  <Ticket size={16} />
                  Đặt vé gần đây
                </span>
                <Link href="/organizer/events" className={styles.listCardLink}>
                  Xem tất cả
                </Link>
              </div>
              <div className={styles.emptyText}>Đang cập nhật dữ liệu...</div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
// Dev by TrBinhDev