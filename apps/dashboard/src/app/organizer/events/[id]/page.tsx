/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { eventService } from "@/services/event.service";
import { Event, Category, TicketType } from "@/types/event.types";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  QrCode,
  Calendar,
  MapPin,
  FileText,
  Tag,
  Clock,
  Ticket,
  Image,
  Layout,
  Edit3,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { format } from "date-fns";

const schema = z.object({
  title: z.string().min(1, "Tên event không được để trống"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  venueName: z.string().min(1, "Tên địa điểm không được để trống"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  city: z.string().min(1, "Thành phố không được để trống"),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  saleStartAt: z.string().min(1),
  saleEndAt: z.string().min(1),
});

const ticketSchema = z.object({
  name: z.string().min(1, "Tên loại vé không được để trống"),
  description: z.string().optional(),
  price: z.number().min(0, "Giá không được âm"),
  totalSlots: z.number().int().min(1, "Số lượng tối thiểu là 1"),
  zone: z.string().optional(),
});

type EventForm = z.infer<typeof schema>;
type TicketForm = z.infer<typeof ticketSchema>;

const toLocalDateTime = (isoString: string) => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "tickets" | "media">(
    "info",
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: zodResolver(schema),
  });

  const ticketForm = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { price: 0, totalSlots: 100 },
  });

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [eventRes, catRes] = await Promise.all([
        eventService.getMyEventById(id),
        eventService.getCategories(),
      ]);
      const e = eventRes.data;
      setEvent(e);
      setCategories(catRes.data);
      reset({
        title: e.title,
        description: e.description || "",
        categoryId: e.categoryId || "",
        venueName: e.venueName,
        address: e.address,
        city: e.city,
        startAt: toLocalDateTime(e.startAt),
        endAt: toLocalDateTime(e.endAt),
        saleStartAt: toLocalDateTime(e.saleStartAt),
        saleEndAt: toLocalDateTime(e.saleEndAt),
      });
      setLoading(false);
    };
    fetch();
  }, [id]);

  const onSubmit = async (data: EventForm) => {
    setSaving(true);
    try {
      await eventService.updateEvent(id, {
        ...data,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
        saleStartAt: new Date(data.saleStartAt).toISOString(),
        saleEndAt: new Date(data.saleEndAt).toISOString(),
        categoryId: data.categoryId || undefined,
      });
      toast.success("Cập nhật thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (
      !confirm(
        `Xác nhận ${status === "PUBLISHED" ? "publish" : "huỷ"} event này?`,
      )
    )
      return;
    try {
      await eventService.updateEventStatus(id, status);
      setEvent((prev) => (prev ? { ...prev, status: status as any } : prev));
      toast.success("Cập nhật trạng thái thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại");
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await eventService.uploadCover(id, file);
      setEvent((prev) => (prev ? { ...prev, coverUrl: res.coverUrl } : prev));
      toast.success("Upload cover thành công");
    } catch {
      toast.error("Upload thất bại");
    }
  };

  const handleUploadSeatingMap = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await eventService.uploadSeatingMap(id, file);
      setEvent((prev) =>
        prev ? { ...prev, seatingMapUrl: res.seatingMapUrl } : prev,
      );
      toast.success("Upload sơ đồ thành công");
    } catch {
      toast.error("Upload thất bại");
    }
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      await eventService.uploadImages(id, files);
      const res = await eventService.getMyEventById(id);
      setEvent(res.data);
      toast.success("Upload ảnh thành công");
    } catch {
      toast.error("Upload thất bại");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await eventService.deleteImage(id, imageId);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              images: prev.images?.filter((img) => img.id !== imageId),
            }
          : prev,
      );
      toast.success("Đã xoá ảnh");
    } catch {
      toast.error("Xoá ảnh thất bại");
    }
  };

  const handleSaveTicket = async (data: TicketForm) => {
    try {
      if (editingTicket) {
        await eventService.updateTicketType(id, editingTicket.id, data);
        toast.success("Cập nhật loại vé thành công");
      } else {
        await eventService.createTicketType(id, data);
        toast.success("Tạo loại vé thành công");
      }
      const res = await eventService.getMyEventById(id);
      setEvent(res.data);
      setShowTicketForm(false);
      setEditingTicket(null);
      ticketForm.reset({ price: 0, totalSlots: 100 });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại");
    }
  };

  const handleDeleteTicket = async (typeId: string) => {
    if (!confirm("Xoá loại vé này?")) return;
    try {
      await eventService.deleteTicketType(id, typeId);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              ticketTypes: prev.ticketTypes.filter((t) => t.id !== typeId),
            }
          : prev,
      );
      toast.success("Đã xoá loại vé");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xoá thất bại");
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  if (loading)
    return (
      <>
        <style>{`
          .ed-skeleton { animation: pulse 1.5s ease-in-out infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="ed-skeleton h-8 bg-[#f0ebe3] rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="ed-skeleton h-96 bg-[#f0ebe3] rounded-xl" />
            </div>
            <div>
              <div className="ed-skeleton h-64 bg-[#f0ebe3] rounded-xl" />
            </div>
          </div>
        </div>
      </>
    );

  if (!event)
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white border border-[#e8e0d5] rounded-xl p-12 text-center">
          <p className="text-[#c0a888]">Không tìm thấy sự kiện</p>
          <Link
            href="/organizer/events"
            className="text-[#c8a882] hover:underline mt-2 inline-block"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );

  return (
    <>
      <style>{`
        /* ── Container ── */
        .ed-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 16px;
        }

        /* ── Header ── */
        .ed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
          padding-top: 8px;
        }

        .ed-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ed-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #a89070;
          font-size: 13px;
          font-weight: 500;
          transition: color 0.18s;
          text-decoration: none;
        }

        .ed-back:hover { color: #3d2f1f; }

        .ed-title {
          font-size: 20px;
          font-weight: 700;
          color: #3d2f1f;
          max-width: 400px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ed-header-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ed-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          text-decoration: none;
        }

        .ed-btn-checkin {
          background: #f0f4fa;
          color: #4a6a8a;
        }
        .ed-btn-checkin:hover { background: #e0e8f0; }

        .ed-btn-publish {
          background: #e8f5ef;
          color: #2e7d5a;
        }
        .ed-btn-publish:hover { background: #d0ece0; }

        .ed-btn-cancel {
          background: #fce8e8;
          color: #b03030;
        }
        .ed-btn-cancel:hover { background: #f8d8d8; }

        /* ── Tabs ── */
        .ed-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: #faf8f5;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #e8e0d5;
        }

        .ed-tab {
          flex: 1;
          padding: 10px 16px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          color: #7d6550;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .ed-tab:hover { color: #3d2f1f; }
        .ed-tab.active {
          background: #fff;
          color: #3d2f1f;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .ed-tab svg { width: 16px; height: 16px; }

        /* ── Card ── */
        .ed-card {
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

        .ed-card-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ed-card-title {
          font-size: 14px;
          font-weight: 700;
          color: #3d2f1f;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ed-card-title svg { color: #c0a888; }

        .ed-card-body { padding: 20px; }

        /* ── Form fields ── */
        .ed-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ed-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #3d2f1f;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ed-label svg { width: 14px; height: 14px; color: #c0a888; }

        .ed-input {
          padding: 9px 14px;
          border: 1.5px solid #e8e0d5;
          border-radius: 10px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: inherit;
          width: 100%;
        }

        .ed-input:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        .ed-input.error { border-color: #d07070; }
        .ed-input.error:focus { box-shadow: 0 0 0 3px rgba(208,112,112,0.14); }

        .ed-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .ed-select {
          padding: 9px 14px;
          border: 1.5px solid #e8e0d5;
          border-radius: 10px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: inherit;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c0a888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          width: 100%;
        }

        .ed-select:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        .ed-error {
          font-size: 12px;
          color: #d07070;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ed-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .ed-btn-save {
          width: 100%;
          padding: 11px;
          background: linear-gradient(135deg, #c8a882, #b8916a);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .ed-btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(184,145,106,0.3);
        }

        .ed-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Tickets ── */
        .ed-ticket-form {
          background: #faf8f5;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid #e8e0d5;
        }

        .ed-ticket-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #f0ebe3;
          transition: background 0.15s;
        }

        .ed-ticket-item:hover { background: #faf8f5; }

        .ed-ticket-name { font-weight: 600; color: #3d2f1f; }
        .ed-ticket-meta { font-size: 12px; color: #a89070; }
        .ed-ticket-price { font-weight: 600; color: #3d2f1f; }

        .ed-ticket-actions { display: flex; gap: 4px; }

        .ed-ticket-btn {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }

        .ed-ticket-btn-edit {
          background: #f0ebe3;
          color: #7d6550;
        }
        .ed-ticket-btn-edit:hover { background: #e8e0d5; }

        .ed-ticket-btn-delete {
          background: #fce8e8;
          color: #b03030;
        }
        .ed-ticket-btn-delete:hover { background: #f8d8d8; }

        /* ── Media ── */
        .ed-media-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .ed-media-item {
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          background: #f0ebe3;
        }

        .ed-media-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ed-media-item .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }

        .ed-media-item:hover .overlay { opacity: 1; }
        .ed-media-item .overlay button {
          background: rgba(255,255,255,0.2);
          border: none;
          color: #fff;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ed-media-item .overlay button:hover { background: rgba(255,255,255,0.3); }

        .ed-upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          border: 2px dashed #e8e0d5;
          border-radius: 10px;
          background: transparent;
          color: #a89070;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          margin-top: 12px;
        }

        .ed-upload-btn:hover {
          border-color: #c8a882;
          color: #8b5e3c;
          background: #faf8f5;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ed-grid-2 { grid-template-columns: 1fr; }
          .ed-title { font-size: 16px; max-width: 200px; }
          .ed-tabs { flex-wrap: wrap; }
          .ed-tab { flex: 1 1 auto; }
          .ed-media-grid { grid-template-columns: repeat(3, 1fr); }
          .ed-header { flex-direction: column; align-items: stretch; }
          .ed-header-actions { justify-content: stretch; }
          .ed-header-actions .ed-btn { flex: 1; justify-content: center; }
        }

        @media (max-width: 480px) {
          .ed-container { padding: 0 12px; }
          .ed-card-body { padding: 14px; }
          .ed-media-grid { grid-template-columns: repeat(2, 1fr); }
          .ed-header-left { flex-wrap: wrap; }
        }
      `}</style>

      <div className="ed-container">
        {/* Header */}
        <div className="ed-header">
          <div className="ed-header-left">
            <Link href="/organizer/events" className="ed-back">
              <ChevronLeft size={16} />
              Quay lại
            </Link>
            <h1 className="ed-title">{event.title}</h1>
          </div>
          <div className="ed-header-actions">
            {event.status === "PUBLISHED" && (
              <Link
                href={`/organizer/events/${id}/checkin`}
                className="ed-btn ed-btn-checkin"
              >
                <QrCode size={16} />
                Check-in
              </Link>
            )}
            {event.status === "DRAFT" && (
              <button
                onClick={() => handleStatusChange("PUBLISHED")}
                className="ed-btn ed-btn-publish"
              >
                <Save size={16} />
                Publish
              </button>
            )}
            {event.status === "PUBLISHED" && (
              <button
                onClick={() => handleStatusChange("CANCELLED")}
                className="ed-btn ed-btn-cancel"
              >
                <X size={16} />
                Huỷ event
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="ed-tabs">
          <button
            onClick={() => setActiveTab("info")}
            className={`ed-tab${activeTab === "info" ? " active" : ""}`}
          >
            <Edit3 size={16} />
            Thông tin
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`ed-tab${activeTab === "tickets" ? " active" : ""}`}
          >
            <Ticket size={16} />
            Loại vé ({event.ticketTypes.length})
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`ed-tab${activeTab === "media" ? " active" : ""}`}
          >
            <Image size={16} />
            Hình ảnh
          </button>
        </div>

        {/* Content */}
        {activeTab === "info" && (
          <div className="ed-card">
            <div className="ed-card-header">
              <div className="ed-card-title">
                <Edit3 size={16} />
                Thông tin sự kiện
              </div>
              <span className="text-xs font-medium text-[#a89070]">
                Trạng thái:{" "}
                {event.status === "PUBLISHED"
                  ? "🟢 Đang bán"
                  : event.status === "DRAFT"
                    ? "🟡 Nháp"
                    : "🔴 Đã huỷ"}
              </span>
            </div>
            <div className="ed-card-body">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="ed-field">
                  <label className="ed-label">
                    <FileText size={14} />
                    Tên sự kiện <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("title")}
                    className={`ed-input ${errors.title ? "error" : ""}`}
                  />
                  {errors.title && (
                    <span className="ed-error">• {errors.title.message}</span>
                  )}
                </div>

                <div className="ed-field">
                  <label className="ed-label">
                    <FileText size={14} />
                    Mô tả
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="ed-input ed-textarea"
                  />
                </div>

                <div className="ed-field">
                  <label className="ed-label">
                    <Tag size={14} />
                    Danh mục
                  </label>
                  <select {...register("categoryId")} className="ed-select">
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ed-field">
                  <label className="ed-label">
                    <MapPin size={14} />
                    Địa điểm <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("venueName")}
                    className={`ed-input ${errors.venueName ? "error" : ""}`}
                    placeholder="Tên địa điểm"
                  />
                  {errors.venueName && (
                    <span className="ed-error">
                      • {errors.venueName.message}
                    </span>
                  )}
                </div>

                <div className="ed-grid-2">
                  <div className="ed-field">
                    <label className="ed-label">
                      <MapPin size={14} />
                      Thành phố <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("city")}
                      className={`ed-input ${errors.city ? "error" : ""}`}
                      placeholder="VD: Hà Nội"
                    />
                    {errors.city && (
                      <span className="ed-error">• {errors.city.message}</span>
                    )}
                  </div>
                  <div className="ed-field">
                    <label className="ed-label">
                      <MapPin size={14} />
                      Địa chỉ <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("address")}
                      className={`ed-input ${errors.address ? "error" : ""}`}
                      placeholder="Địa chỉ cụ thể"
                    />
                    {errors.address && (
                      <span className="ed-error">
                        • {errors.address.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ed-grid-2">
                  <div className="ed-field">
                    <label className="ed-label">
                      <Calendar size={14} />
                      Bắt đầu <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("startAt")}
                      type="datetime-local"
                      className={`ed-input ${errors.startAt ? "error" : ""}`}
                    />
                    {errors.startAt && (
                      <span className="ed-error">
                        • {errors.startAt.message}
                      </span>
                    )}
                  </div>
                  <div className="ed-field">
                    <label className="ed-label">
                      <Calendar size={14} />
                      Kết thúc <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("endAt")}
                      type="datetime-local"
                      className={`ed-input ${errors.endAt ? "error" : ""}`}
                    />
                    {errors.endAt && (
                      <span className="ed-error">• {errors.endAt.message}</span>
                    )}
                  </div>
                </div>

                <div className="ed-grid-2">
                  <div className="ed-field">
                    <label className="ed-label">
                      <Ticket size={14} />
                      Bắt đầu bán vé <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("saleStartAt")}
                      type="datetime-local"
                      className={`ed-input ${errors.saleStartAt ? "error" : ""}`}
                    />
                    {errors.saleStartAt && (
                      <span className="ed-error">
                        • {errors.saleStartAt.message}
                      </span>
                    )}
                  </div>
                  <div className="ed-field">
                    <label className="ed-label">
                      <Ticket size={14} />
                      Kết thúc bán vé <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register("saleEndAt")}
                      type="datetime-local"
                      className={`ed-input ${errors.saleEndAt ? "error" : ""}`}
                    />
                    {errors.saleEndAt && (
                      <span className="ed-error">
                        • {errors.saleEndAt.message}
                      </span>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={saving} className="ed-btn-save">
                  {saving ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="ed-card">
            <div className="ed-card-header">
              <div className="ed-card-title">
                <Ticket size={16} />
                Quản lý loại vé
              </div>
              <button
                onClick={() => {
                  setShowTicketForm(true);
                  setEditingTicket(null);
                  ticketForm.reset({
                    price: 0,
                    totalSlots: 100,
                    name: "",
                    description: "",
                    zone: "",
                  });
                }}
                className="ed-btn ed-btn-publish"
                style={{
                  background: "linear-gradient(135deg, #c8a882, #b8916a)",
                  color: "#fff",
                }}
              >
                <Plus size={14} />
                Thêm loại vé
              </button>
            </div>
            <div className="ed-card-body">
              {showTicketForm && (
                <div className="ed-ticket-form">
                  <h4 className="font-semibold text-[#3d2f1f] text-sm mb-3">
                    {editingTicket ? "✏️ Sửa loại vé" : "➕ Thêm loại vé mới"}
                  </h4>
                  <form
                    onSubmit={ticketForm.handleSubmit(handleSaveTicket)}
                    className="flex flex-col gap-3"
                  >
                    <div className="ed-grid-2">
                      <div className="ed-field">
                        <label className="ed-label">
                          Tên loại vé <span className="text-red-400">*</span>
                        </label>
                        <input
                          {...ticketForm.register("name")}
                          placeholder="VD: VIP"
                          className="ed-input"
                        />
                      </div>
                      <div className="ed-field">
                        <label className="ed-label">Khu vực</label>
                        <input
                          {...ticketForm.register("zone")}
                          placeholder="VD: Khu A"
                          className="ed-input"
                        />
                      </div>
                      <div className="ed-field">
                        <label className="ed-label">
                          Giá (VNĐ) <span className="text-red-400">*</span>
                        </label>
                        <input
                          {...ticketForm.register("price", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          min="0"
                          className="ed-input"
                        />
                      </div>
                      <div className="ed-field">
                        <label className="ed-label">
                          Số lượng <span className="text-red-400">*</span>
                        </label>
                        <input
                          {...ticketForm.register("totalSlots", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          min="1"
                          className="ed-input"
                        />
                      </div>
                    </div>
                    <div className="ed-field">
                      <label className="ed-label">Mô tả</label>
                      <input
                        {...ticketForm.register("description")}
                        placeholder="Mô tả loại vé..."
                        className="ed-input"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowTicketForm(false);
                          setEditingTicket(null);
                        }}
                        className="flex-1 py-2 border border-[#e8e0d5] rounded-lg text-sm text-[#7d6550] hover:border-[#c8a882] transition-colors"
                      >
                        Huỷ
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-gradient-to-r from-[#c8a882] to-[#b8916a] text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all"
                      >
                        {editingTicket ? "Cập nhật" : "Thêm"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {event.ticketTypes.length === 0 ? (
                <div className="text-center py-8 text-[#c0a888] text-sm">
                  <Ticket size={32} className="mx-auto mb-2 opacity-30" />
                  Chưa có loại vé nào
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {event.ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="ed-ticket-item">
                      <div>
                        <div className="ed-ticket-name">{ticket.name}</div>
                        <div className="ed-ticket-meta">
                          {ticket.zone && `${ticket.zone} · `}
                          Còn {ticket.availableSlots}/{ticket.totalSlots} vé
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="ed-ticket-price">
                          {formatCurrency(Number(ticket.price))}
                        </span>
                        <div className="ed-ticket-actions">
                          <button
                            onClick={() => {
                              setEditingTicket(ticket);
                              setShowTicketForm(true);
                              ticketForm.reset({
                                name: ticket.name,
                                description: ticket.description || "",
                                price: Number(ticket.price),
                                totalSlots: ticket.totalSlots,
                                zone: ticket.zone || "",
                              });
                            }}
                            className="ed-ticket-btn ed-ticket-btn-edit"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="ed-ticket-btn ed-ticket-btn-delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cover */}
            <div className="lg:col-span-2 ed-card">
              <div className="ed-card-header">
                <div className="ed-card-title">
                  <Image size={16} />
                  Ảnh bìa
                </div>
              </div>
              <div className="ed-card-body">
                <div className="aspect-video bg-[#f0ebe3] rounded-xl overflow-hidden mb-3">
                  {event.coverUrl ? (
                    <img
                      src={event.coverUrl}
                      className="w-full h-full object-cover"
                      alt="Cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c0a888] text-sm">
                      Chưa có ảnh bìa
                    </div>
                  )}
                </div>
                <label className="ed-upload-btn">
                  <Upload size={14} />
                  Upload ảnh bìa
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadCover}
                  />
                </label>
              </div>
            </div>

            {/* Seating map */}
            <div className="ed-card">
              <div className="ed-card-header">
                <div className="ed-card-title">
                  <Layout size={16} />
                  Sơ đồ chỗ ngồi
                </div>
              </div>
              <div className="ed-card-body">
                {event.seatingMapUrl ? (
                  <img
                    src={event.seatingMapUrl}
                    className="w-full rounded-xl mb-3"
                    alt="Seating map"
                  />
                ) : (
                  <div className="aspect-square bg-[#f0ebe3] rounded-xl flex items-center justify-center text-[#c0a888] text-sm mb-3">
                    Chưa có sơ đồ
                  </div>
                )}
                <label className="ed-upload-btn">
                  <Upload size={14} />
                  Upload sơ đồ
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadSeatingMap}
                  />
                </label>
              </div>
            </div>

            {/* Gallery */}
            <div className="lg:col-span-3 ed-card">
              <div className="ed-card-header">
                <div className="ed-card-title">
                  <Image size={16} />
                  Gallery ({event.images?.length || 0}/10)
                </div>
              </div>
              <div className="ed-card-body">
                {event.images && event.images.length > 0 ? (
                  <div className="ed-media-grid">
                    {event.images.map((img) => (
                      <div key={img.id} className="ed-media-item">
                        <img src={img.url} alt="" />
                        <div className="overlay">
                          <button onClick={() => handleDeleteImage(img.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#c0a888] text-sm">
                    <Image size={32} className="mx-auto mb-2 opacity-30" />
                    Chưa có ảnh gallery
                  </div>
                )}
                <label
                  className="ed-upload-btn"
                  style={{
                    marginTop: event.images && event.images.length > 0 ? 12 : 0,
                  }}
                >
                  <Upload size={14} />
                  Upload ảnh gallery
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUploadImages}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
