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

const STATUS_CONFIG = {
  PUBLISHED: { label: "Đang bán", color: "ev-badge-published" },
  DRAFT: { label: "Nháp", color: "ev-badge-draft" },
  CANCELLED: { label: "Đã huỷ", color: "ev-badge-cancelled" },
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
        // Giả sử API trả về pagination, nếu không thì tính toán từ dữ liệu
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

  // Pagination logic
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

  // Stats
  const draftCount = events.filter((e) => e.status === "DRAFT").length;
  const publishedCount = events.filter((e) => e.status === "PUBLISHED").length;

  return (
    <>
      <style>{`
        /* ── Container ── */
        .ev-container {
          width: 100%;
        }

        /* ── Stats ── */
        .ev-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .ev-stat-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 12px;
          padding: 14px 18px;
          animation: fade-in-up 0.35s ease both;
        }

        .ev-stat-card:nth-child(1) { animation-delay: 0.03s; }
        .ev-stat-card:nth-child(2) { animation-delay: 0.06s; }
        .ev-stat-card:nth-child(3) { animation-delay: 0.09s; }

        .ev-stat-label {
          font-size: 11px;
          font-weight: 600;
          color: #c0a888;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ev-stat-label svg {
          width: 14px;
          height: 14px;
        }

        .ev-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #3d2f1f;
          margin-top: 4px;
        }

        /* ── Header ── */
        .ev-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .ev-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ev-tab {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid #e8e0d5;
          background: #fff;
          color: #7d6550;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .ev-tab:hover {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .ev-tab.active {
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 2px 8px rgba(184,145,106,0.25);
        }

        .ev-btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 20px;
          background: linear-gradient(135deg, #c8a882, #b8916a);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          text-decoration: none;
        }

        .ev-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(184,145,106,0.3);
        }

        /* ── Search ── */
        .ev-search-wrap {
          position: relative;
          margin-bottom: 20px;
        }

        .ev-search-wrap svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #c0a888;
          pointer-events: none;
        }

        .ev-search-input {
          width: 100%;
          padding: 10px 16px 10px 38px;
          border: 1.5px solid #e8e0d5;
          border-radius: 10px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: inherit;
        }

        .ev-search-input::placeholder {
          color: #c8b89a;
        }

        .ev-search-input:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        /* ── Grid ── */
        .ev-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* ── Card ── */
        .ev-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.25s;
          animation: fade-in-up 0.35s ease both;
        }

        .ev-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
          border-color: #d5c8b8;
        }

        .ev-card:nth-child(1) { animation-delay: 0.05s; }
        .ev-card:nth-child(2) { animation-delay: 0.08s; }
        .ev-card:nth-child(3) { animation-delay: 0.11s; }
        .ev-card:nth-child(4) { animation-delay: 0.14s; }
        .ev-card:nth-child(5) { animation-delay: 0.17s; }
        .ev-card:nth-child(6) { animation-delay: 0.20s; }

        @keyframes fade-in-up {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .ev-card-cover {
          aspect-ratio: 16/9;
          background: #f0ebe3;
          position: relative;
          overflow: hidden;
        }

        .ev-card-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ev-card-cover .fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .ev-card-badge {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .ev-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 12px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
        }

        .ev-badge::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ev-badge-published {
          background: #e8f5ef;
          color: #2e7d5a;
        }
        .ev-badge-published::before { background: #3a9e70; }

        .ev-badge-draft {
          background: #faf0e0;
          color: #a0692a;
        }
        .ev-badge-draft::before { background: #c89040; }

        .ev-badge-cancelled {
          background: #fce8e8;
          color: #b03030;
        }
        .ev-badge-cancelled::before { background: #d07070; }

        .ev-card-body {
          padding: 16px 18px 18px;
        }

        .ev-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #3d2f1f;
          line-height: 1.3;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ev-card-meta {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 14px;
        }

        .ev-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #7d6550;
        }

        .ev-meta-item svg {
          width: 14px;
          height: 14px;
          color: #c0a888;
          flex-shrink: 0;
        }

        .ev-meta-item .highlight {
          font-weight: 600;
          color: #3d2f1f;
        }

        .ev-card-actions {
          display: flex;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid #f0ebe3;
        }

        .ev-card-actions .ev-btn {
          flex: 1;
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          text-align: center;
          text-decoration: none;
        }

        .ev-btn-outline {
          background: #fff;
          border: 1.5px solid #e8e0d5;
          color: #7d6550;
        }

        .ev-btn-outline:hover {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .ev-btn-success {
          background: #e8f5ef;
          color: #2e7d5a;
        }

        .ev-btn-success:hover {
          background: #d0ece0;
        }

        .ev-btn-info {
          background: #f0f4fa;
          color: #4a6a8a;
        }

        .ev-btn-info:hover {
          background: #e0e8f0;
        }

        .ev-btn-danger {
          background: #fce8e8;
          color: #b03030;
        }

        .ev-btn-danger:hover {
          background: #f8d8d8;
        }

        /* ── Skeleton ── */
        .ev-skeleton {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          overflow: hidden;
        }

        .ev-skeleton-cover {
          aspect-ratio: 16/9;
          background: linear-gradient(90deg, #f0ebe3 25%, #e8e0d5 50%, #f0ebe3 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
        }

        .ev-skeleton-body {
          padding: 16px 18px 18px;
        }

        .ev-skeleton-line {
          height: 14px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f0ebe3 25%, #e8e0d5 50%, #f0ebe3 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
        }

        .ev-skeleton-line.title {
          height: 18px;
          width: 75%;
          margin-bottom: 12px;
        }

        .ev-skeleton-line.meta {
          height: 12px;
          width: 60%;
          margin-bottom: 4px;
        }

        .ev-skeleton-line.meta:last-child {
          width: 45%;
          margin-bottom: 14px;
        }

        .ev-skeleton-actions {
          display: flex;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid #f0ebe3;
        }

        .ev-skeleton-actions .ev-skeleton-line {
          flex: 1;
          height: 32px;
          border-radius: 8px;
        }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        /* ── Empty ── */
        .ev-empty {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          padding: 48px 16px;
          text-align: center;
          animation: fade-in-up 0.35s ease both;
        }

        .ev-empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .ev-empty-text {
          font-weight: 500;
          color: #c0a888;
        }

        .ev-empty-sub {
          font-size: 12px;
          color: #d5c8b8;
          margin-top: 4px;
        }

        /* ── Pagination ── */
        .ev-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          padding: 12px 16px;
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
        }

        .ev-page-btn {
          display: flex;
          align-items: center;
          gap: 4px;
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

        .ev-page-btn:hover:not(:disabled) {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .ev-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .ev-page-num {
          min-width: 34px;
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

        .ev-page-num:hover {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .ev-page-num.active {
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-color: transparent;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(184,145,106,0.3);
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .ev-stats {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .ev-header {
            flex-direction: column;
            align-items: stretch;
          }

          .ev-tabs {
            justify-content: center;
          }

          .ev-btn-primary {
            justify-content: center;
          }

          .ev-grid {
            grid-template-columns: 1fr;
          }

          .ev-card-actions {
            flex-wrap: wrap;
          }

          .ev-card-actions .ev-btn {
            flex: 1 1 calc(50% - 4px);
          }
        }

        @media (max-width: 480px) {
          .ev-stats {
            grid-template-columns: 1fr 1fr;
          }

          .ev-tabs {
            gap: 4px;
          }

          .ev-tab {
            padding: 6px 12px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="ev-container">
        {/* Stats */}
        <div className="ev-stats">
          <div className="ev-stat-card">
            <div className="ev-stat-label">
              <span>📋</span>
              Tổng sự kiện
            </div>
            <div className="ev-stat-value">{events.length}</div>
          </div>
          <div className="ev-stat-card">
            <div className="ev-stat-label">
              <span>📝</span>
              Nháp
            </div>
            <div className="ev-stat-value" style={{ color: "#a0692a" }}>
              {draftCount}
            </div>
          </div>
          <div className="ev-stat-card">
            <div className="ev-stat-label">
              <span>🚀</span>
              Đang bán
            </div>
            <div className="ev-stat-value" style={{ color: "#2e7d5a" }}>
              {publishedCount}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="ev-header">
          <div className="ev-tabs">
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
                className={`ev-tab${activeTab === tab.value ? " active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link href="/organizer/events/create" className="ev-btn-primary">
            <Plus size={16} />
            Tạo event
          </Link>
        </div>

        {/* Search */}
        <div className="ev-search-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="ev-search-input"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="ev-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ev-skeleton">
                <div className="ev-skeleton-cover" />
                <div className="ev-skeleton-body">
                  <div className="ev-skeleton-line title" />
                  <div className="ev-skeleton-line meta" />
                  <div className="ev-skeleton-line meta" />
                  <div className="ev-skeleton-actions">
                    <div className="ev-skeleton-line" />
                    <div className="ev-skeleton-line" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="ev-empty">
            <div className="ev-empty-icon">🎭</div>
            <p className="ev-empty-text">
              {search ? "Không tìm thấy sự kiện nào" : "Chưa có sự kiện nào"}
            </p>
            <p className="ev-empty-sub">
              {search
                ? `Không có kết quả cho "${search}"`
                : "Hãy tạo sự kiện đầu tiên của bạn"}
            </p>
            {!search && (
              <Link
                href="/organizer/events/create"
                className="ev-btn-primary"
                style={{ display: "inline-flex", marginTop: 16 }}
              >
                <Plus size={16} />
                Tạo event đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="ev-grid">
              {paginatedEvents.map((event) => (
                <div key={event.id} className="ev-card">
                  {/* Cover */}
                  <div className="ev-card-cover">
                    {event.coverUrl ? (
                      <img src={event.coverUrl} alt={event.title} />
                    ) : (
                      <div className="fallback">🎭</div>
                    )}
                    <div className="ev-card-badge">
                      <span
                        className={`ev-badge ${STATUS_CONFIG[event.status].color}`}
                      >
                        {STATUS_CONFIG[event.status].label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ev-card-body">
                    <h3 className="ev-card-title">{event.title}</h3>
                    <div className="ev-card-meta">
                      <div className="ev-meta-item">
                        <Calendar size={14} />
                        <span>
                          {format(new Date(event.startAt), "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}
                        </span>
                      </div>
                      <div className="ev-meta-item">
                        <MapPin size={14} />
                        <span className="line-clamp-1">
                          {event.venueName}, {event.city}
                        </span>
                      </div>
                      <div className="ev-meta-item">
                        <Ticket size={14} />
                        <span>
                          <span className="highlight">
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

                    {/* Actions */}
                    <div className="ev-card-actions">
                      <Link
                        href={`/organizer/events/${event.id}`}
                        className="ev-btn ev-btn-outline"
                      >
                        Chi tiết
                      </Link>
                      {event.status === "DRAFT" && (
                        <button
                          onClick={() =>
                            handleStatusChange(event.id, "PUBLISHED")
                          }
                          className="ev-btn ev-btn-success"
                        >
                          Publish
                        </button>
                      )}
                      {event.status === "PUBLISHED" && (
                        <Link
                          href={`/organizer/events/${event.id}/checkin`}
                          className="ev-btn ev-btn-info"
                        >
                          Check-in
                        </Link>
                      )}
                      {event.status === "DRAFT" && (
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="ev-btn ev-btn-danger"
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

            {/* Pagination */}
            {totalFilteredPages > 1 && (
              <div className="ev-pagination">
                <button
                  className="ev-page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={15} />
                  Trước
                </button>
                {Array.from(
                  { length: totalFilteredPages },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`ev-page-num${p === page ? " active" : ""}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="ev-page-btn"
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
    </>
  );
}
