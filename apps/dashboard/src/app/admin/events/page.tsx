/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { eventService } from "@/services/event.service";
import { Event } from "@/types/event.types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";
import styles from "./events.module.css";

const STATUS_CONFIG = {
  PUBLISHED: { label: "Đang bán", cls: styles.badgePublished },
  DRAFT: { label: "Nháp", cls: styles.badgeDraft },
  CANCELLED: { label: "Đã huỷ", cls: styles.badgeCancelled },
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await eventService.getAllEvents({
          page,
          limit: 10,
          status: statusFilter || undefined,
        });
        setEvents(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [page, statusFilter]);

  const handleCancelEvent = async (id: string) => {
    toast.custom(
      (t) => (
        <div
          className={`max-w-md w-full bg-white rounded-xl shadow-lg border border-[#e8e0d5] p-5 ${
            t.visible ? "animate-fade-in-up" : "animate-fade-out-down"
          }`}
          style={{
            animationDuration: "0.2s",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#b03030"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#3d2f1f] text-sm">
                Xác nhận huỷ event
              </p>
              <p className="text-sm text-[#7d6550] mt-1">
                Bạn có chắc chắn muốn huỷ event này? Hành động này không thể
                hoàn tác.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-[#7d6550] bg-[#f0ebe3] rounded-lg hover:bg-[#e8e0d5] transition-colors"
            >
              Huỷ bỏ
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await eventService.adminUpdateEventStatus(id, "CANCELLED");
                  setEvents((prev) =>
                    prev.map((e) =>
                      e.id === id ? { ...e, status: "CANCELLED" } : e,
                    ),
                  );
                  toast.success("Đã huỷ event thành công");
                } catch (err: any) {
                  toast.error(
                    err.response?.data?.message || "Huỷ event thất bại",
                  );
                }
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              Xác nhận huỷ
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "top-center",
      },
    );
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm sự kiện, thành phố..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.input}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className={styles.select}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PUBLISHED">Đang bán</option>
          <option value="DRAFT">Nháp</option>
          <option value="CANCELLED">Đã huỷ</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.card}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Sự kiện</th>
              <th className={styles.th}>Thời gian</th>
              <th className={styles.th}>Trạng thái</th>
              <th className={styles.th}>Vé</th>
              <th className={styles.th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.skeletonEventCell}>
                      <div
                        className={styles.skeleton}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          className={styles.skeleton}
                          style={{ height: 14, width: "70%", marginBottom: 6 }}
                        />
                        <div
                          className={styles.skeleton}
                          style={{ height: 12, width: "40%" }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div
                      className={styles.skeleton}
                      style={{ height: 14, width: 90 }}
                    />
                  </td>
                  <td className={styles.td}>
                    <div
                      className={styles.skeleton}
                      style={{ height: 22, width: 72, borderRadius: 99 }}
                    />
                  </td>
                  <td className={styles.td}>
                    <div
                      className={styles.skeleton}
                      style={{ height: 14, width: 50 }}
                    />
                  </td>
                  <td className={styles.td}>
                    <div
                      className={styles.skeleton}
                      style={{ height: 28, width: 48, borderRadius: 8 }}
                    />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((event) => {
                const sold = event.ticketTypes.reduce(
                  (s, t) => s + (t.totalSlots - t.availableSlots),
                  0,
                );
                const total = event.ticketTypes.reduce(
                  (s, t) => s + t.totalSlots,
                  0,
                );
                const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT;

                return (
                  <tr key={event.id} className={styles.tr}>
                    {/* Event */}
                    <td className={styles.td}>
                      <div className={styles.eventCell}>
                        <div className={styles.cover}>
                          {event.coverUrl ? (
                            <img src={event.coverUrl} alt="" />
                          ) : (
                            "🎭"
                          )}
                        </div>
                        <div>
                          <div className={styles.eventTitle}>{event.title}</div>
                          <div className={styles.eventLocation}>
                            <MapPin size={11} />
                            {event.city}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className={styles.td}>
                      <div className={styles.date}>
                        <Calendar size={13} />
                        {format(new Date(event.startAt), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Tickets */}
                    <td className={styles.td}>
                      <span className={styles.ticket}>{sold}</span>
                      <span className={styles.ticketTotal}>/{total}</span>
                    </td>

                    {/* Action */}
                    <td className={styles.td}>
                      {event.status !== "CANCELLED" && (
                        <button
                          className={styles.btnCancel}
                          onClick={() => handleCancelEvent(event.id)}
                        >
                          Huỷ
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`${styles.pageNum}${p === page ? ` ${styles.active}` : ""}`}
              >
                {p}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
