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
  Users,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type CheckinResult = {
  status: "success" | "error";
  message: string;
  ticketId: string;
} | null;

export default function CheckinPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualId, setManualId] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckinResult>(null);
  const [checkinCount, setCheckinCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const res = await eventService.getMyEventById(id);
      setEvent(res.data);
      setLoading(false);
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

  if (loading)
    return (
      <>
        <style>{`
          .ci-skeleton { animation: pulse 1.5s ease-in-out infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
        <div className="max-w-xl mx-auto px-4 py-6">
          <div className="ci-skeleton h-8 bg-[#f0ebe3] rounded w-1/3 mb-4" />
          <div className="ci-skeleton h-24 bg-[#f0ebe3] rounded-xl mb-4" />
          <div className="ci-skeleton h-80 bg-[#f0ebe3] rounded-xl" />
        </div>
      </>
    );

  if (!event) return null;

  return (
    <>
      <style>{`
        /* ── Container ── */
        .ci-container {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 16px;
        }

        /* ── Back link ── */
        .ci-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #a89070;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
          transition: color 0.18s;
          text-decoration: none;
        }

        .ci-back:hover {
          color: #3d2f1f;
        }

        .ci-back svg {
          width: 16px;
          height: 16px;
        }

        /* ── Card ── */
        .ci-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          overflow: hidden;
          animation: fade-in-up 0.35s ease both;
        }

        @keyframes fade-in-up {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .ci-card-padding {
          padding: 20px 24px;
        }

        /* ── Event info ── */
        .ci-event {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ci-event-thumb {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          background: linear-gradient(135deg, #faf8f5, #f0ebe3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .ci-event-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ci-event-info {
          flex: 1;
          min-width: 0;
        }

        .ci-event-title {
          font-size: 15px;
          font-weight: 700;
          color: #3d2f1f;
          line-height: 1.3;
        }

        .ci-event-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .ci-event-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #a89070;
        }

        .ci-event-meta-item svg {
          width: 13px;
          height: 13px;
        }

        .ci-event-stats {
          text-align: center;
          flex-shrink: 0;
          padding-left: 16px;
          border-left: 1.5px solid #f0ebe3;
        }

        .ci-event-stats-number {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #c8a882, #b8916a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .ci-event-stats-label {
          font-size: 10px;
          font-weight: 600;
          color: #c0a888;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 2px;
        }

        /* ── Scanner area ── */
        .ci-scanner-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .ci-scanner-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #faf8f5, #f0ebe3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c0a888;
          flex-shrink: 0;
        }

        .ci-scanner-title {
          font-size: 14px;
          font-weight: 600;
          color: #3d2f1f;
        }

        .ci-scanner-sub {
          font-size: 12px;
          color: #a89070;
          margin-top: 1px;
        }

        /* ── QR placeholder ── */
        .ci-qr-area {
          position: relative;
          border: 2px dashed #e8e0d5;
          border-radius: 12px;
          padding: 32px 16px;
          text-align: center;
          background: #faf8f5;
          margin-bottom: 16px;
          transition: border-color 0.3s;
        }

        .ci-qr-area:hover {
          border-color: #c8a882;
        }

        .ci-qr-area .ci-qr-icon {
          color: #d5c8b8;
          margin-bottom: 8px;
        }

        .ci-qr-area .main-text {
          font-size: 13px;
          color: #7d6550;
          font-weight: 500;
        }

        .ci-qr-area .sub-text {
          font-size: 12px;
          color: #c0a888;
          margin-top: 2px;
        }

        .ci-qr-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: #c8a882;
          border-style: solid;
          border-width: 0;
        }

        .ci-qr-corner.tl {
          top: 12px;
          left: 12px;
          border-top-width: 2px;
          border-left-width: 2px;
          border-radius: 4px 0 0 0;
        }

        .ci-qr-corner.tr {
          top: 12px;
          right: 12px;
          border-top-width: 2px;
          border-right-width: 2px;
          border-radius: 0 4px 0 0;
        }

        .ci-qr-corner.bl {
          bottom: 12px;
          left: 12px;
          border-bottom-width: 2px;
          border-left-width: 2px;
          border-radius: 0 0 0 4px;
        }

        .ci-qr-corner.br {
          bottom: 12px;
          right: 12px;
          border-bottom-width: 2px;
          border-right-width: 2px;
          border-radius: 0 0 4px 0;
        }

        /* ── Input ── */
        .ci-input-wrap {
          display: flex;
          gap: 10px;
        }

        .ci-input {
          flex: 1;
          padding: 10px 16px;
          border: 1.5px solid #e8e0d5;
          border-radius: 10px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13.5px;
          font-family: 'Courier New', monospace;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }

        .ci-input::placeholder {
          color: #c8b89a;
          font-family: inherit;
        }

        .ci-input:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        .ci-btn {
          padding: 10px 24px;
          background: linear-gradient(135deg, #c8a882, #b8916a);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          white-space: nowrap;
        }

        .ci-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(184,145,106,0.3);
        }

        .ci-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .ci-btn-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          vertical-align: middle;
          margin-right: 6px;
        }

        /* ── Result ── */
        .ci-result {
          border-radius: 12px;
          padding: 16px 20px;
          margin-top: 16px;
          animation: fade-in-up 0.3s ease both;
        }

        .ci-result-success {
          background: #e8f5ef;
          border: 1px solid #c8e8d8;
        }

        .ci-result-error {
          background: #fce8e8;
          border: 1px solid #f0c8c8;
        }

        .ci-result-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .ci-result-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .ci-result-icon svg {
          width: 22px;
          height: 22px;
        }

        .ci-result-success .ci-result-icon svg {
          color: #2e7d5a;
        }

        .ci-result-error .ci-result-icon svg {
          color: #b03030;
        }

        .ci-result-message {
          font-weight: 600;
          font-size: 14px;
        }

        .ci-result-success .ci-result-message {
          color: #2e7d5a;
        }

        .ci-result-error .ci-result-message {
          color: #b03030;
        }

        .ci-result-id {
          font-size: 12px;
          font-family: 'Courier New', monospace;
          color: #a89070;
          margin-top: 2px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .ci-event {
            flex-wrap: wrap;
          }

          .ci-event-stats {
            padding-left: 0;
            border-left: none;
            width: 100%;
            padding-top: 12px;
            border-top: 1.5px solid #f0ebe3;
          }

          .ci-input-wrap {
            flex-direction: column;
          }

          .ci-btn {
            justify-content: center;
          }

          .ci-card-padding {
            padding: 16px;
          }

          .ci-container {
            padding: 0 12px;
          }

          .ci-qr-area {
            padding: 24px 12px;
          }
        }
      `}</style>

      <div className="ci-container">
        {/* Back link */}
        <Link href={`/organizer/events/${id}`} className="ci-back">
          <ChevronLeft size={16} />
          Quay lại event
        </Link>

        {/* Event info */}
        <div
          className="ci-card ci-card-padding"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="ci-event">
            <div className="ci-event-thumb">
              {event?.coverUrl ? <img src={event.coverUrl} alt="" /> : "🎭"}
            </div>
            <div className="ci-event-info">
              <div className="ci-event-title">{event?.title}</div>
              <div className="ci-event-meta">
                <span className="ci-event-meta-item">
                  <MapPin size={13} />
                  {event?.venueName}
                </span>
                <span className="ci-event-meta-item">
                  <Calendar size={13} />
                  {event?.city}
                </span>
              </div>
            </div>
            <div className="ci-event-stats">
              <div className="ci-event-stats-number">{checkinCount}</div>
              <div className="ci-event-stats-label">Đã check-in</div>
            </div>
          </div>
        </div>

        {/* Scanner */}
        <div
          className="ci-card ci-card-padding"
          style={{ animationDelay: "0.1s", marginTop: 16 }}
        >
          <div className="ci-scanner-header">
            <div className="ci-scanner-icon">
              <QrCode size={20} />
            </div>
            <div>
              <div className="ci-scanner-title">Quét mã QR</div>
              <div className="ci-scanner-sub">
                Dùng máy quét QR hoặc nhập mã vé thủ công
              </div>
            </div>
          </div>

          {/* QR visual */}
          <div className="ci-qr-area">
            <Camera size={40} className="ci-qr-icon" />
            <p className="main-text">Hướng camera vào mã QR trên vé</p>
            <p className="sub-text">Hoặc nhập mã vé bên dưới</p>
            <div className="ci-qr-corner tl" />
            <div className="ci-qr-corner tr" />
            <div className="ci-qr-corner bl" />
            <div className="ci-qr-corner br" />
          </div>

          {/* Input */}
          <form onSubmit={handleManualSubmit} className="ci-input-wrap">
            <input
              ref={inputRef}
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập hoặc scan mã vé..."
              className="ci-input"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={checking || !manualId.trim()}
              className="ci-btn"
            >
              {checking ? (
                <>
                  <span className="ci-btn-spinner" />
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
          <div className={`ci-result ci-result-${result.status}`}>
            <div className="ci-result-content">
              <div className="ci-result-icon">
                {result.status === "success" ? (
                  <CheckCircle size={22} />
                ) : (
                  <XCircle size={22} />
                )}
              </div>
              <div>
                <div className="ci-result-message">{result.message}</div>
                <div className="ci-result-id">
                  #{result.ticketId.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
