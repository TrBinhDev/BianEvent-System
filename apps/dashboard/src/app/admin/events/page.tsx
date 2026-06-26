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

const STATUS_CONFIG = {
  PUBLISHED: { label: "Đang bán", cls: "ef-badge-published" },
  DRAFT: { label: "Nháp", cls: "ef-badge-draft" },
  CANCELLED: { label: "Đã huỷ", cls: "ef-badge-cancelled" },
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
    if (!confirm("Huỷ event này?")) return;
    try {
      await eventService.adminUpdateEventStatus(id, "CANCELLED");
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "CANCELLED" } : e)),
      );
      toast.success("Đã huỷ event");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại");
    }
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <style>{`
        /* ── Filters ── */
        .ef-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .ef-search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .ef-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #c0a888;
          pointer-events: none;
        }

        .ef-input {
          width: 100%;
          padding: 9px 14px 9px 36px;
          border: 1.5px solid #e8e0d5;
          border-radius: 10px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: inherit;
        }

        .ef-input::placeholder { color: #c8b89a; }

        .ef-input:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        .ef-select {
          padding: 9px 32px 9px 12px;
          border: 1.5px solid #e8e0d5;
          border-radius: 10px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13.5px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: inherit;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c0a888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }

        .ef-select:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        /* ── Card ── */
        .ef-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          overflow: hidden;
          animation: fade-in-up 0.35s ease both;
        }

        .ef-table {
          width: 100%;
          border-collapse: collapse;
        }

        /* ── Head ── */
        .ef-thead tr {
          background: #faf8f5;
          border-bottom: 1px solid #e8e0d5;
        }

        .ef-th {
          padding: 11px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #c0a888;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          white-space: nowrap;
        }

        /* ── Rows ── */
        .ef-tr {
          border-bottom: 1px solid #f0ebe3;
          transition: background 0.15s;
        }

        .ef-tr:last-child { border-bottom: none; }
        .ef-tr:hover      { background: #faf8f5; }

        .ef-td {
          padding: 12px 16px;
          font-size: 13.5px;
          color: #3d2f1f;
          vertical-align: middle;
        }

        /* Event cell */
        .ef-event-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ef-cover {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          border: 1px solid #e8e0d5;
        }

        .ef-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ef-event-title {
          font-weight: 600;
          font-size: 13.5px;
          color: #3d2f1f;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ef-event-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #a89070;
          margin-top: 2px;
        }

        /* Date cell */
        .ef-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #7d6550;
          white-space: nowrap;
        }

        .ef-date svg { color: #c0a888; }

        /* Ticket cell */
        .ef-ticket {
          font-size: 13px;
          color: #5a3e28;
          font-weight: 600;
        }

        .ef-ticket-total {
          font-size: 12px;
          color: #a89070;
          font-weight: 400;
        }

        /* Status badges */
        .ef-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .ef-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ef-badge-published {
          background: #e8f5ef;
          color: #2e7d5a;
        }
        .ef-badge-published::before { background: #3a9e70; }

        .ef-badge-draft {
          background: #faf0e0;
          color: #a0692a;
        }
        .ef-badge-draft::before { background: #c89040; }

        .ef-badge-cancelled {
          background: #fce8e8;
          color: #b03030;
        }
        .ef-badge-cancelled::before { background: #d07070; }

        /* Action */
        .ef-btn-cancel {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          background: #fce8e8;
          color: #b03030;
          border: 1px solid #f0c8c8;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .ef-btn-cancel:hover {
          background: #f8d8d8;
          border-color: #e0a8a8;
        }

        /* Empty & loading */
        .ef-empty {
          padding: 48px 16px;
          text-align: center;
          color: #c0a888;
          font-size: 14px;
        }

        .ef-skeleton {
          border-radius: 6px;
          background: linear-gradient(90deg, #f0ebe3 25%, #e8e0d5 50%, #f0ebe3 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
        }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        /* Pagination */
        .ef-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 14px 16px;
          border-top: 1px solid #e8e0d5;
        }

        .ef-page-btn {
          padding: 6px 14px;
          border-radius: 9px;
          border: 1.5px solid #e8e0d5;
          background: #fff;
          color: #7d6550;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .ef-page-btn:hover:not(:disabled) {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .ef-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .ef-page-num {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1.5px solid #e8e0d5;
          background: #fff;
          color: #7d6550;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ef-page-num:hover { border-color: #c8a882; color: #8b5e3c; }

        .ef-page-num.active {
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-color: transparent;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(184,145,106,0.3);
        }
      `}</style>

      {/* Filters */}
      <div className="ef-filters">
        <div className="ef-search-wrap">
          <Search size={15} className="ef-search-icon" />
          <input
            type="text"
            placeholder="Tìm sự kiện, thành phố..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ef-input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="ef-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PUBLISHED">Đang bán</option>
          <option value="DRAFT">Nháp</option>
          <option value="CANCELLED">Đã huỷ</option>
        </select>
      </div>

      {/* Table */}
      <div className="ef-card">
        <table className="ef-table">
          <thead className="ef-thead">
            <tr>
              <th className="ef-th">Sự kiện</th>
              <th className="ef-th">Thời gian</th>
              <th className="ef-th">Trạng thái</th>
              <th className="ef-th">Vé</th>
              <th className="ef-th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="ef-tr">
                  <td className="ef-td">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        className="ef-skeleton"
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          className="ef-skeleton"
                          style={{ height: 14, width: "70%", marginBottom: 6 }}
                        />
                        <div
                          className="ef-skeleton"
                          style={{ height: 12, width: "40%" }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="ef-td">
                    <div
                      className="ef-skeleton"
                      style={{ height: 14, width: 90 }}
                    />
                  </td>
                  <td className="ef-td">
                    <div
                      className="ef-skeleton"
                      style={{ height: 22, width: 72, borderRadius: 99 }}
                    />
                  </td>
                  <td className="ef-td">
                    <div
                      className="ef-skeleton"
                      style={{ height: 14, width: 50 }}
                    />
                  </td>
                  <td className="ef-td">
                    <div
                      className="ef-skeleton"
                      style={{ height: 28, width: 48, borderRadius: 8 }}
                    />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="ef-empty">
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
                  <tr key={event.id} className="ef-tr">
                    {/* Event */}
                    <td className="ef-td">
                      <div className="ef-event-cell">
                        <div className="ef-cover">
                          {event.coverUrl ? (
                            <img src={event.coverUrl} alt="" />
                          ) : (
                            "🎭"
                          )}
                        </div>
                        <div>
                          <div className="ef-event-title">{event.title}</div>
                          <div className="ef-event-location">
                            <MapPin size={11} />
                            {event.city}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="ef-td">
                      <div className="ef-date">
                        <Calendar size={13} />
                        {format(new Date(event.startAt), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="ef-td">
                      <span className={`ef-badge ${cfg.cls}`}>{cfg.label}</span>
                    </td>

                    {/* Tickets */}
                    <td className="ef-td">
                      <span className="ef-ticket">{sold}</span>
                      <span className="ef-ticket-total">/{total}</span>
                    </td>

                    {/* Action */}
                    <td className="ef-td">
                      {event.status !== "CANCELLED" && (
                        <button
                          className="ef-btn-cancel"
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
          <div className="ef-pagination">
            <button
              className="ef-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`ef-page-num${p === page ? " active" : ""}`}
              >
                {p}
              </button>
            ))}
            <button
              className="ef-page-btn"
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
