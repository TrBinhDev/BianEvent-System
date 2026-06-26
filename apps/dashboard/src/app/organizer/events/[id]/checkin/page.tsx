/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { eventService } from "@/services/event.service";
import { bookingService } from "@/services/booking.service";
import { Event } from "@/types/event.types";
import {
  ChevronLeft,
  QrCode,
  CheckCircle,
  XCircle,
  Camera,
  Calendar,
  MapPin,
  TrendingUp,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "./checkin.module.css";

type CheckinResult = {
  status: "success" | "error";
  message: string;
  ticketId: string;
} | null;

type EventStats = {
  totalRevenue: number;
  ticketTypes: {
    ticketTypeId: string;
    name: string;
    totalSlots: number;
    availableSlots: number;
    soldSlots: number;
    revenue: number;
  }[];
};

export default function CheckinPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualId, setManualId] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckinResult>(null);
  const [checkinCount, setCheckinCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [eventRes, statsRes] = await Promise.all([
          eventService.getMyEventById(id),
          eventService
            .getEventStats(id)
            .catch(() => ({ data: { totalRevenue: 0, ticketTypes: [] } })),
        ]);
        setEvent(eventRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleCheckin = async (ticketId: string) => {
    if (!ticketId.trim()) return;
    setChecking(true);
    setResult(null);

    try {
      await bookingService.checkinTicket(ticketId.trim());
      setResult({
        status: "success",
        message: "Check-in thành công!",
        ticketId: ticketId.trim(),
      });
      setCheckinCount((c) => c + 1);
      toast.success("Check-in thành công!");

      try {
        const statsRes = await eventService.getEventStats(id);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to refresh stats:", err);
      }
    } catch (err: any) {
      setResult({
        status: "error",
        message: err.response?.data?.message || "Check-in thất bại",
        ticketId: ticketId.trim(),
      });
      toast.error(err.response?.data?.message || "Check-in thất bại");
    } finally {
      setChecking(false);
      setManualId("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckin(manualId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCheckin(manualId);
    }
  };

  const totalSold =
    stats?.ticketTypes?.reduce((sum, t) => sum + t.soldSlots, 0) || 0;
  const totalSlots =
    stats?.ticketTypes?.reduce((sum, t) => sum + t.totalSlots, 0) || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  if (loading) {
    return (
      <div className={styles.skeletonContainer}>
        <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
        <div className={`${styles.skeleton} ${styles.skeletonCardLarge}`} />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className={styles.container}>
      {/* Back link */}
      <Link href={`/organizer/events/${id}`} className={styles.back}>
        <ChevronLeft size={16} />
        Quay lại event
      </Link>

      {/* Stats */}
      <div className={`${styles.card} ${styles.cardPadding}`}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{totalSold}</div>
            <div className={styles.statLabel}>Vé đã bán</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{totalSlots}</div>
            <div className={styles.statLabel}>Tổng vé</div>
          </div>
          <div className={styles.statItem}>
            <div className={`${styles.statNumber} ${styles.revenue}`}>
              {totalRevenue.toLocaleString("vi-VN")}đ
            </div>
            <div className={styles.statLabel}>Doanh thu</div>
          </div>
        </div>
      </div>

      {/* Event info */}
      <div
        className={`${styles.card} ${styles.cardPadding} ${styles.marginTop}`}
      >
        <div className={styles.event}>
          <div className={styles.eventThumb}>
            {event?.coverUrl ? <img src={event.coverUrl} alt="" /> : "🎭"}
          </div>
          <div className={styles.eventInfo}>
            <div className={styles.eventTitle}>{event?.title}</div>
            <div className={styles.eventMeta}>
              <span className={styles.eventMetaItem}>
                <MapPin size={13} />
                {event?.venueName}
              </span>
              <span className={styles.eventMetaItem}>
                <Calendar size={13} />
                {event?.city}
              </span>
            </div>
          </div>
          <div className={styles.eventStats}>
            <div className={styles.eventStatsNumber}>{checkinCount}</div>
            <div className={styles.eventStatsLabel}>Đã check-in</div>
          </div>
        </div>
      </div>

      {/* Scanner */}
      <div
        className={`${styles.card} ${styles.cardPadding} ${styles.marginTop}`}
      >
        <div className={styles.scannerHeader}>
          <div className={styles.scannerIcon}>
            <QrCode size={20} />
          </div>
          <div>
            <div className={styles.scannerTitle}>Quét mã QR</div>
            <div className={styles.scannerSub}>
              Dùng máy quét QR hoặc nhập mã vé thủ công
            </div>
          </div>
        </div>

        <div className={styles.qrArea}>
          <Camera size={40} className={styles.qrIcon} />
          <p className={styles.mainText}>Hướng camera vào mã QR trên vé</p>
          <p className={styles.subText}>Hoặc nhập mã vé bên dưới</p>
          <div className={`${styles.qrCorner} ${styles.tl}`} />
          <div className={`${styles.qrCorner} ${styles.tr}`} />
          <div className={`${styles.qrCorner} ${styles.bl}`} />
          <div className={`${styles.qrCorner} ${styles.br}`} />
        </div>

        <form onSubmit={handleManualSubmit} className={styles.inputWrap}>
          <input
            ref={inputRef}
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập hoặc scan mã vé..."
            className={styles.input}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={checking || !manualId.trim()}
            className={styles.btn}
          >
            {checking ? (
              <>
                <span className={styles.btnSpinner} />
                Đang xử lý
              </>
            ) : (
              "Check-in"
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`${styles.result} ${styles[`result${result.status === "success" ? "Success" : "Error"}`]}`}
        >
          <div className={styles.resultContent}>
            <div className={styles.resultIcon}>
              {result.status === "success" ? (
                <CheckCircle size={22} />
              ) : (
                <XCircle size={22} />
              )}
            </div>
            <div>
              <div className={styles.resultMessage}>{result.message}</div>
              <div className={styles.resultId}>
                #{result.ticketId.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
