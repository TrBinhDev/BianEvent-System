/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Ticket,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { eventService } from "@/services/event.service";
import { Event } from "@/types/event.types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";
import styles from "./events.module.css";

const STATUS_CONFIG = {
  PUBLISHED: { label: "Đang bán", color: styles.badgePublished },
  DRAFT: { label: "Nháp", color: styles.badgeDraft },
  CANCELLED: { label: "Đã huỷ", color: styles.badgeCancelled },
};

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await eventService.getMyEvents(activeTab || undefined);
        setEvents(res.data);
        setTotalPages(Math.ceil(res.data.length / 9) || 1);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeTab]);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()),
  );

  const itemsPerPage = 9;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedEvents = filtered.slice(startIndex, startIndex + itemsPerPage);
  const totalFilteredPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá event này?")) return;
    try {
      await eventService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Đã xoá event");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xoá thất bại");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await eventService.updateEventStatus(id, status);
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: status as any } : e)),
      );
      toast.success("Cập nhật trạng thái thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại");
    }
  };

  const draftCount = events.filter((e) => e.status === "DRAFT").length;
  const publishedCount = events.filter((e) => e.status === "PUBLISHED").length;

  return (
    <div className={styles.container}>
      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span>📋</span>
            Tổng sự kiện
          </div>
          <div className={styles.statValue}>{events.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span>📝</span>
            Nháp
          </div>
          <div className={styles.statValue} style={{ color: "#a0692a" }}>
            {draftCount}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <span>🚀</span>
            Đang bán
          </div>
          <div className={styles.statValue} style={{ color: "#2e7d5a" }}>
            {publishedCount}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.tabs}>
          {[
            { value: "", label: "📋 Tất cả" },
            { value: "DRAFT", label: "📝 Nháp" },
            { value: "PUBLISHED", label: "🚀 Đang bán" },
            { value: "CANCELLED", label: "❌ Đã huỷ" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(1);
              }}
              className={`${styles.tab}${activeTab === tab.value ? ` ${styles.active}` : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Link href="/organizer/events/create" className={styles.btnPrimary}>
          <Plus size={16} />
          Tạo event
        </Link>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Tìm kiếm sự kiện..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={styles.searchInput}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonCover} />
              <div className={styles.skeletonBody}>
                <div className={`${styles.skeletonLine} ${styles.title}`} />
                <div className={`${styles.skeletonLine} ${styles.meta}`} />
                <div className={`${styles.skeletonLine} ${styles.meta}`} />
                <div className={styles.skeletonActions}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎭</div>
          <p className={styles.emptyText}>
            {search ? "Không tìm thấy sự kiện nào" : "Chưa có sự kiện nào"}
          </p>
          <p className={styles.emptySub}>
            {search
              ? `Không có kết quả cho "${search}"`
              : "Hãy tạo sự kiện đầu tiên của bạn"}
          </p>
          {!search && (
            <Link
              href="/organizer/events/create"
              className={styles.btnPrimary}
              style={{ display: "inline-flex", marginTop: 16 }}
            >
              <Plus size={16} />
              Tạo event đầu tiên
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {paginatedEvents.map((event) => (
              <div key={event.id} className={styles.card}>
                <div className={styles.cardCover}>
                  {event.coverUrl ? (
                    <img src={event.coverUrl} alt={event.title} />
                  ) : (
                    <div className={styles.fallback}>🎭</div>
                  )}
                  <div className={styles.cardBadge}>
                    <span
                      className={`${styles.badge} ${STATUS_CONFIG[event.status].color}`}
                    >
                      {STATUS_CONFIG[event.status].label}
                    </span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{event.title}</h3>
                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <Calendar size={14} />
                      <span>
                        {format(new Date(event.startAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <MapPin size={14} />
                      <span className={styles.lineClamp}>
                        {event.venueName}, {event.city}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <Ticket size={14} />
                      <span>
                        <span className={styles.highlight}>
                          {event.ticketTypes.reduce(
                            (s, t) => s + (t.totalSlots - t.availableSlots),
                            0,
                          )}
                        </span>
                        /
                        {event.ticketTypes.reduce(
                          (s, t) => s + t.totalSlots,
                          0,
                        )}{" "}
                        vé đã bán
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <Link
                      href={`/organizer/events/${event.id}`}
                      className={`${styles.btn} ${styles.btnOutline}`}
                    >
                      Chi tiết
                    </Link>
                    {event.status === "DRAFT" && (
                      <button
                        onClick={() =>
                          handleStatusChange(event.id, "PUBLISHED")
                        }
                        className={`${styles.btn} ${styles.btnSuccess}`}
                      >
                        Publish
                      </button>
                    )}
                    {event.status === "PUBLISHED" && (
                      <Link
                        href={`/organizer/events/${event.id}/checkin`}
                        className={`${styles.btn} ${styles.btnInfo}`}
                      >
                        Check-in
                      </Link>
                    )}
                    {event.status === "DRAFT" && (
                      <button
                        onClick={() => handleDelete(event.id)}
                        className={`${styles.btn} ${styles.btnDanger}`}
                        style={{
                          flex: "none",
                          paddingLeft: 16,
                          paddingRight: 16,
                        }}
                      >
                        Xoá
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalFilteredPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={15} />
                Trước
              </button>
              {Array.from({ length: totalFilteredPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`${styles.pageNum}${p === page ? ` ${styles.active}` : ""}`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                className={styles.pageBtn}
                onClick={() =>
                  setPage((p) => Math.min(totalFilteredPages, p + 1))
                }
                disabled={page === totalFilteredPages}
              >
                Sau
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
