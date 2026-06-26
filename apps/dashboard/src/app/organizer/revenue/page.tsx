/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { eventService } from "@/services/event.service";
import {
  Calendar,
  MapPin,
  Ticket,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import styles from "./revenue.module.css";

interface EventStats {
  totalRevenue: number;
  ticketTypes: {
    ticketTypeId: string;
    name: string;
    totalSlots: number;
    availableSlots: number;
    soldSlots: number;
    revenue: number;
  }[];
}

interface EventWithStats {
  id: string;
  title: string;
  status: string;
  city: string;
  venueName: string;
  startAt: string;
  coverUrl: string | null;
  stats: EventStats | null;
  loading: boolean;
}

export default function RevenuePage() {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await eventService.getMyEvents();
        const eventList = eventsRes.data || [];

        const eventsWithStats = await Promise.all(
          eventList.map(async (event: any) => {
            try {
              const statsRes = await eventService.getEventStats(event.id);
              return {
                ...event,
                stats: statsRes.data,
                loading: false,
              };
            } catch (err) {
              console.error(`Failed to get stats for event ${event.id}:`, err);
              return {
                ...event,
                stats: null,
                loading: false,
              };
            }
          }),
        );

        let totalRev = 0;
        let totalSold = 0;

        eventsWithStats.forEach((event: any) => {
          if (event.stats) {
            totalRev += event.stats.totalRevenue || 0;
            event.stats.ticketTypes?.forEach((t: any) => {
              totalSold += t.soldSlots || 0;
            });
          }
        });

        setEvents(eventsWithStats);
        setTotalRevenue(totalRev);
        setTotalTicketsSold(totalSold);
      } catch (err) {
        console.error("Failed to fetch revenue data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const revenueEvents = events.filter(
    (event) =>
      event.stats &&
      (event.stats.totalRevenue > 0 ||
        event.stats.ticketTypes?.some((t: any) => t.soldSlots > 0)),
  );

  const noRevenueEvents = events.filter(
    (event) =>
      !event.stats ||
      (event.stats.totalRevenue === 0 &&
        !event.stats.ticketTypes?.some((t: any) => t.soldSlots > 0)),
  );

  return (
    <div className={styles.container}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng doanh thu</div>
          <div className={`${styles.statValue} ${styles.revenue}`}>
            {formatCurrency(totalRevenue)}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng vé bán ra</div>
          <div className={styles.statValue}>{totalTicketsSold}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Sự kiện có doanh thu</div>
          <div className={styles.statValue}>{revenueEvents.length}</div>
        </div>
      </div>

      {/* Revenue by Event */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>
            <TrendingUp size={18} />
            Doanh thu theo sự kiện
          </span>
          <span className={styles.cardCount}>{events.length} sự kiện</span>
        </div>

        {loading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.loadingItem}>
                <div className={styles.loadingThumb} />
                <div className={styles.loadingText}>
                  <div />
                  <div />
                </div>
                <div className={styles.loadingRevenue} />
              </div>
            ))}
          </>
        ) : revenueEvents.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💰</div>
            <p className={styles.emptyText}>Chưa có doanh thu</p>
            <p className={styles.emptySub}>
              Sự kiện của bạn chưa có vé nào được bán
            </p>
          </div>
        ) : (
          <>
            {revenueEvents.map((event) => {
              const revenue = event.stats?.totalRevenue || 0;
              const soldSlots =
                event.stats?.ticketTypes?.reduce(
                  (sum, t) => sum + t.soldSlots,
                  0,
                ) || 0;

              return (
                <Link
                  key={event.id}
                  href={`/organizer/events/${event.id}`}
                  className={styles.eventItem}
                >
                  <div className={styles.eventLeft}>
                    <div className={styles.eventThumb}>
                      {event.coverUrl ? (
                        <img src={event.coverUrl} alt="" />
                      ) : (
                        "🎭"
                      )}
                    </div>
                    <div className={styles.eventInfo}>
                      <div className={styles.eventTitle}>{event.title}</div>
                      <div className={styles.eventMeta}>
                        <span className={styles.eventMetaItem}>
                          <Calendar size={13} />
                          {format(new Date(event.startAt), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </span>
                        <span className={styles.eventMetaItem}>
                          <MapPin size={13} />
                          {event.city}
                        </span>
                        <span
                          className={`${styles.badge} ${
                            event.status === "PUBLISHED"
                              ? styles.badgePublished
                              : event.status === "DRAFT"
                                ? styles.badgeDraft
                                : styles.badgeCancelled
                          }`}
                        >
                          {event.status === "PUBLISHED"
                            ? "Đang bán"
                            : event.status === "DRAFT"
                              ? "Nháp"
                              : "Đã huỷ"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.eventRight}>
                    <div className={styles.eventStats}>
                      <div
                        className={`${styles.eventRevenue} ${styles.highlight}`}
                      >
                        {formatCurrency(revenue)}
                      </div>
                      <div className={styles.eventSold}>
                        {soldSlots} vé bán ra
                      </div>
                    </div>
                    <ChevronRight size={18} className={styles.eventArrow} />
                  </div>
                </Link>
              );
            })}

            {/* Sự kiện chưa có doanh thu */}
            {noRevenueEvents.length > 0 && (
              <>
                <div className={styles.divider}>
                  <span className={styles.dividerText}>
                    Sự kiện chưa có doanh thu
                  </span>
                </div>
                {noRevenueEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/organizer/events/${event.id}`}
                    className={`${styles.eventItem} ${styles.noRevenue}`}
                  >
                    <div className={styles.eventLeft}>
                      <div className={styles.eventThumb}>
                        {event.coverUrl ? (
                          <img src={event.coverUrl} alt="" />
                        ) : (
                          "🎭"
                        )}
                      </div>
                      <div className={styles.eventInfo}>
                        <div className={styles.eventTitle}>{event.title}</div>
                        <div className={styles.eventMeta}>
                          <span className={styles.eventMetaItem}>
                            <Calendar size={13} />
                            {format(new Date(event.startAt), "dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </span>
                          <span className={styles.eventMetaItem}>
                            <MapPin size={13} />
                            {event.city}
                          </span>
                          <span
                            className={`${styles.badge} ${
                              event.status === "PUBLISHED"
                                ? styles.badgePublished
                                : event.status === "DRAFT"
                                  ? styles.badgeDraft
                                  : styles.badgeCancelled
                            }`}
                          >
                            {event.status === "PUBLISHED"
                              ? "Đang bán"
                              : event.status === "DRAFT"
                                ? "Nháp"
                                : "Đã huỷ"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.eventRight}>
                      <div className={styles.eventStats}>
                        <div className={styles.eventRevenueZero}>0đ</div>
                        <div className={styles.eventSold}>0 vé bán ra</div>
                      </div>
                      <ChevronRight size={18} className={styles.eventArrow} />
                    </div>
                  </Link>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
