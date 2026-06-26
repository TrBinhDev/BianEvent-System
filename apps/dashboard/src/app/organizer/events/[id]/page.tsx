/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { eventService } from "@/services/event.service";
import { bookingService } from "@/services/booking.service";
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
  Ticket,
  Image,
  Layout,
  Edit3,
  Save,
  X,
  ClipboardList,
  Users,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "./detail.module.css";

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
  const [activeTab, setActiveTab] = useState<"info" | "tickets" | "media" | "bookings">(
    "info",
  );

  type Booking = {
    id: string;
    userId: string;
    userFullName: string | null;
    userEmail: string | null;
    quantity: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    tickets: { id: string; status: string }[];
  };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsPagination, setBookingsPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [bookingsLoading, setBookingsLoading] = useState(false);

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

  const fetchBookings = async (page = 1) => {
    setBookingsLoading(true);
    try {
      const res = await bookingService.getEventBookings(id, { page, limit: 10 });
      setBookings(res.data);
      setBookingsPagination(res.pagination);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tải đơn đặt vé thất bại");
    } finally {
      setBookingsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  if (loading) {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonMain} />
          <div className={styles.skeletonSide} />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundText}>Không tìm thấy sự kiện</p>
        <Link href="/organizer/events" className={styles.notFoundLink}>
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/organizer/events" className={styles.back}>
            <ChevronLeft size={16} />
            Quay lại
          </Link>
          <h1 className={styles.title}>{event.title}</h1>
        </div>
        <div className={styles.headerActions}>
          {event.status === "PUBLISHED" && (
            <Link
              href={`/organizer/events/${id}/checkin`}
              className={styles.btnCheckin}
            >
              <QrCode size={16} />
              Check-in
            </Link>
          )}
          {event.status === "DRAFT" && (
            <button
              onClick={() => handleStatusChange("PUBLISHED")}
              className={styles.btnPublish}
            >
              <Save size={16} />
              Publish
            </button>
          )}
          {event.status === "PUBLISHED" && (
            <button
              onClick={() => handleStatusChange("CANCELLED")}
              className={styles.btnCancel}
            >
              <X size={16} />
              Huỷ event
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("info")}
          className={`${styles.tab}${activeTab === "info" ? ` ${styles.active}` : ""}`}
        >
          <Edit3 size={16} />
          Thông tin
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`${styles.tab}${activeTab === "tickets" ? ` ${styles.active}` : ""}`}
        >
          <Ticket size={16} />
          Loại vé ({event.ticketTypes.length})
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`${styles.tab}${activeTab === "media" ? ` ${styles.active}` : ""}`}
        >
          <Image size={16} />
          Hình ảnh
        </button>
        <button
          onClick={() => { setActiveTab("bookings"); fetchBookings(1); }}
          className={`${styles.tab}${activeTab === "bookings" ? ` ${styles.active}` : ""}`}
        >
          <ClipboardList size={16} />
          Đơn đặt vé
        </button>
      </div>

      {/* Content */}
      {activeTab === "info" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Edit3 size={16} />
              Thông tin sự kiện
            </div>
            <span className={styles.cardStatus}>
              Trạng thái:{" "}
              {event.status === "PUBLISHED"
                ? "🟢 Đang bán"
                : event.status === "DRAFT"
                  ? "🟡 Nháp"
                  : "🔴 Đã huỷ"}
            </span>
          </div>
          <div className={styles.cardBody}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <FileText size={14} />
                  Tên sự kiện <span className={styles.required}>*</span>
                </label>
                <input
                  {...register("title")}
                  className={`${styles.input} ${errors.title ? styles.error : ""}`}
                />
                {errors.title && (
                  <span className={styles.errorMsg}>
                    • {errors.title.message}
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <FileText size={14} />
                  Mô tả
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className={`${styles.input} ${styles.textarea}`}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Tag size={14} />
                  Danh mục
                </label>
                <select {...register("categoryId")} className={styles.select}>
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <MapPin size={14} />
                  Địa điểm <span className={styles.required}>*</span>
                </label>
                <input
                  {...register("venueName")}
                  className={`${styles.input} ${errors.venueName ? styles.error : ""}`}
                  placeholder="Tên địa điểm"
                />
                {errors.venueName && (
                  <span className={styles.errorMsg}>
                    • {errors.venueName.message}
                  </span>
                )}
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <MapPin size={14} />
                    Thành phố <span className={styles.required}>*</span>
                  </label>
                  <input
                    {...register("city")}
                    className={`${styles.input} ${errors.city ? styles.error : ""}`}
                    placeholder="VD: Hà Nội"
                  />
                  {errors.city && (
                    <span className={styles.errorMsg}>
                      • {errors.city.message}
                    </span>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <MapPin size={14} />
                    Địa chỉ <span className={styles.required}>*</span>
                  </label>
                  <input
                    {...register("address")}
                    className={`${styles.input} ${errors.address ? styles.error : ""}`}
                    placeholder="Địa chỉ cụ thể"
                  />
                  {errors.address && (
                    <span className={styles.errorMsg}>
                      • {errors.address.message}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Calendar size={14} />
                    Bắt đầu <span className={styles.required}>*</span>
                  </label>
                  <input
                    {...register("startAt")}
                    type="datetime-local"
                    className={`${styles.input} ${errors.startAt ? styles.error : ""}`}
                  />
                  {errors.startAt && (
                    <span className={styles.errorMsg}>
                      • {errors.startAt.message}
                    </span>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Calendar size={14} />
                    Kết thúc <span className={styles.required}>*</span>
                  </label>
                  <input
                    {...register("endAt")}
                    type="datetime-local"
                    className={`${styles.input} ${errors.endAt ? styles.error : ""}`}
                  />
                  {errors.endAt && (
                    <span className={styles.errorMsg}>
                      • {errors.endAt.message}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Ticket size={14} />
                    Bắt đầu bán vé <span className={styles.required}>*</span>
                  </label>
                  <input
                    {...register("saleStartAt")}
                    type="datetime-local"
                    className={`${styles.input} ${errors.saleStartAt ? styles.error : ""}`}
                  />
                  {errors.saleStartAt && (
                    <span className={styles.errorMsg}>
                      • {errors.saleStartAt.message}
                    </span>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Ticket size={14} />
                    Kết thúc bán vé <span className={styles.required}>*</span>
                  </label>
                  <input
                    {...register("saleEndAt")}
                    type="datetime-local"
                    className={`${styles.input} ${errors.saleEndAt ? styles.error : ""}`}
                  />
                  {errors.saleEndAt && (
                    <span className={styles.errorMsg}>
                      • {errors.saleEndAt.message}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={styles.btnSave}
              >
                {saving ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "tickets" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
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
              className={styles.btnAddTicket}
            >
              <Plus size={14} />
              Thêm loại vé
            </button>
          </div>
          <div className={styles.cardBody}>
            {showTicketForm && (
              <div className={styles.ticketForm}>
                <h4 className={styles.ticketFormTitle}>
                  {editingTicket ? "✏️ Sửa loại vé" : "➕ Thêm loại vé mới"}
                </h4>
                <form
                  onSubmit={ticketForm.handleSubmit(handleSaveTicket)}
                  className={styles.ticketFormContent}
                >
                  <div className={styles.grid2}>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        Tên loại vé <span className={styles.required}>*</span>
                      </label>
                      <input
                        {...ticketForm.register("name")}
                        placeholder="VD: VIP"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Khu vực</label>
                      <input
                        {...ticketForm.register("zone")}
                        placeholder="VD: Khu A"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        Giá (VNĐ) <span className={styles.required}>*</span>
                      </label>
                      <input
                        {...ticketForm.register("price", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        Số lượng <span className={styles.required}>*</span>
                      </label>
                      <input
                        {...ticketForm.register("totalSlots", {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="1"
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Mô tả</label>
                    <input
                      {...ticketForm.register("description")}
                      placeholder="Mô tả loại vé..."
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.ticketFormActions}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTicketForm(false);
                        setEditingTicket(null);
                      }}
                      className={styles.btnCancelTicket}
                    >
                      Huỷ
                    </button>
                    <button type="submit" className={styles.btnSubmitTicket}>
                      {editingTicket ? "Cập nhật" : "Thêm"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {event.ticketTypes.length === 0 ? (
              <div className={styles.emptyTickets}>
                <Ticket size={32} className={styles.emptyTicketsIcon} />
                Chưa có loại vé nào
              </div>
            ) : (
              <div className={styles.ticketList}>
                {event.ticketTypes.map((ticket) => (
                  <div key={ticket.id} className={styles.ticketItem}>
                    <div>
                      <div className={styles.ticketName}>{ticket.name}</div>
                      <div className={styles.ticketMeta}>
                        {ticket.zone && `${ticket.zone} · `}
                        Còn {ticket.availableSlots}/{ticket.totalSlots} vé
                      </div>
                    </div>
                    <div className={styles.ticketRight}>
                      <span className={styles.ticketPrice}>
                        {formatCurrency(Number(ticket.price))}
                      </span>
                      <div className={styles.ticketActions}>
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
                          className={styles.ticketBtnEdit}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className={styles.ticketBtnDelete}
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

      {activeTab === "bookings" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <ClipboardList size={16} />
              Đơn đặt vé ({bookingsPagination.total})
            </div>
          </div>

          <table className={styles.bTable}>
            <thead className={styles.bThead}>
              <tr>
                <th className={styles.bTh}>Khách hàng</th>
                <th className={styles.bTh}>Mã đơn</th>
                <th className={styles.bTh}>Số lượng</th>
                <th className={styles.bTh}>Check-in</th>
                <th className={styles.bTh}>Ngày đặt</th>
                <th className={styles.bTh}>Tổng tiền</th>
                <th className={styles.bTh}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookingsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={styles.bTr}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className={styles.bTd}>
                        <div className={styles.bSkeleton} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.bEmpty}>
                    <Users size={36} strokeWidth={1.5} style={{ marginBottom: 8, color: "#e8e0d5" }} />
                    <p>Chưa có đơn đặt vé nào</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className={styles.bTr}>
                    <td className={styles.bTd}>
                      <div className={styles.bUserName}>{booking.userFullName ?? "—"}</div>
                      <div className={styles.bUserEmail}>
                        {booking.userEmail ?? booking.userId.slice(0, 12)}
                      </div>
                    </td>
                    <td className={styles.bTd}>
                      <span className={styles.bId}>
                        #{booking.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className={styles.bTd}>{booking.quantity} vé</td>
                    <td className={styles.bTd}>
                      {booking.tickets.filter((t) => t.status === "USED").length}
                      /{booking.tickets.length}
                    </td>
                    <td className={styles.bTd}>
                      <span className={styles.bDate}>
                        <Calendar size={13} />
                        {new Date(booking.createdAt).toLocaleString("vi-VN", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className={styles.bTd}>
                      <span className={styles.bAmount}>
                        {formatCurrency(Number(booking.totalAmount))}
                      </span>
                    </td>
                    <td className={styles.bTd}>
                      <span className={`${styles.badge} ${booking.status === "CONFIRMED" ? styles.badgeSuccess : styles.badgeError}`}>
                        {booking.status === "CONFIRMED" ? "Đã xác nhận" : booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {bookingsPagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={bookingsPagination.page <= 1}
                onClick={() => fetchBookings(bookingsPagination.page - 1)}
                className={styles.pageBtn}
              >
                ←
              </button>
              <span className={styles.pageInfo}>
                {bookingsPagination.page} / {bookingsPagination.totalPages}
              </span>
              <button
                disabled={bookingsPagination.page >= bookingsPagination.totalPages}
                onClick={() => fetchBookings(bookingsPagination.page + 1)}
                className={styles.pageBtn}
              >
                →
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "media" && (
        <div className={styles.mediaGrid}>
          {/* Cover */}
          <div className={`${styles.mediaCard} ${styles.mediaCardCover}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Image size={16} />
                Ảnh bìa
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.coverPreview}>
                {event.coverUrl ? (
                  <img
                    src={event.coverUrl}
                    className={styles.coverImage}
                    alt="Cover"
                  />
                ) : (
                  <div className={styles.coverPlaceholder}>Chưa có ảnh bìa</div>
                )}
              </div>
              <label className={styles.uploadBtn}>
                <Upload size={14} />
                Upload ảnh bìa
                <input
                  type="file"
                  accept="image/*"
                  className={styles.uploadInput}
                  onChange={handleUploadCover}
                />
              </label>
            </div>
          </div>

          {/* Seating map */}
          <div className={styles.mediaCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Layout size={16} />
                Sơ đồ chỗ ngồi
              </div>
            </div>
            <div className={styles.cardBody}>
              {event.seatingMapUrl ? (
                <img
                  src={event.seatingMapUrl}
                  className={styles.seatingMapImage}
                  alt="Seating map"
                />
              ) : (
                <div className={styles.seatingMapPlaceholder}>
                  Chưa có sơ đồ
                </div>
              )}
              <label className={styles.uploadBtn}>
                <Upload size={14} />
                Upload sơ đồ
                <input
                  type="file"
                  accept="image/*"
                  className={styles.uploadInput}
                  onChange={handleUploadSeatingMap}
                />
              </label>
            </div>
          </div>

          {/* Gallery */}
          <div className={`${styles.mediaCard} ${styles.mediaCardFull}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Image size={16} />
                Gallery ({event.images?.length || 0}/10)
              </div>
            </div>
            <div className={styles.cardBody}>
              {event.images && event.images.length > 0 ? (
                <div className={styles.mediaGrid}>
                  {event.images.map((img) => (
                    <div key={img.id} className={styles.mediaItem}>
                      <img src={img.url} alt="" />
                      <div className={styles.mediaOverlay}>
                        <button onClick={() => handleDeleteImage(img.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyGallery}>
                  <Image size={32} className={styles.emptyGalleryIcon} />
                  Chưa có ảnh gallery
                </div>
              )}
              <label className={styles.uploadBtn}>
                <Upload size={14} />
                Upload ảnh gallery
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.uploadInput}
                  onChange={handleUploadImages}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
