/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { eventService } from "@/services/event.service";
import { Category } from "@/types/event.types";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Tag,
  FileText,
  Clock,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().min(1, "Tên event không được để trống"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  venueName: z.string().min(1, "Tên địa điểm không được để trống"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  city: z.string().min(1, "Thành phố không được để trống"),
  startAt: z.string().min(1, "Thời gian bắt đầu không được để trống"),
  endAt: z.string().min(1, "Thời gian kết thúc không được để trống"),
  saleStartAt: z
    .string()
    .min(1, "Thời gian bắt đầu bán vé không được để trống"),
  saleEndAt: z.string().min(1, "Thời gian kết thúc bán vé không được để trống"),
});

type CreateEventForm = z.infer<typeof schema>;

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventForm>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    eventService.getCategories().then((res) => setCategories(res.data));
  }, []);

  const onSubmit = async (data: CreateEventForm) => {
    setLoading(true);
    try {
      const res = await eventService.createEvent({
        ...data,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
        saleStartAt: new Date(data.saleStartAt).toISOString(),
        saleEndAt: new Date(data.saleEndAt).toISOString(),
        categoryId: data.categoryId || undefined,
      });
      toast.success("Tạo event thành công!");
      router.push(`/organizer/events/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tạo event thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* ── Container ── */
        .ce-container {
          max-width: 720px;
          margin: 0 auto;
        }

        /* ── Back link ── */
        .ce-back {
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

        .ce-back:hover {
          color: #3d2f1f;
        }

        .ce-back svg {
          width: 16px;
          height: 16px;
        }

        /* ── Card ── */
        .ce-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 14px;
          padding: 28px 32px;
          animation: fade-in-up 0.35s ease both;
        }

        @keyframes fade-in-up {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .ce-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #3d2f1f;
          margin-bottom: 6px;
        }

        .ce-card-sub {
          font-size: 13px;
          color: #a89070;
          margin-bottom: 24px;
        }

        /* ── Form ── */
        .ce-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ce-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .ce-label {
          font-size: 13px;
          font-weight: 600;
          color: #3d2f1f;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ce-label svg {
          width: 15px;
          height: 15px;
          color: #c0a888;
        }

        .ce-label .required {
          color: #d07070;
          font-weight: 700;
        }

        .ce-input {
          padding: 10px 14px;
          border: 1.5px solid #e8e0d5;
          border-radius: 10px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: inherit;
          width: 100%;
        }

        .ce-input::placeholder {
          color: #c8b89a;
        }

        .ce-input:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        .ce-input.error {
          border-color: #d07070;
        }

        .ce-input.error:focus {
          box-shadow: 0 0 0 3px rgba(208,112,112,0.14);
        }

        .ce-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .ce-select {
          padding: 10px 14px;
          border: 1.5px solid #e8e0d5;
          border-radius: 10px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13.5px;
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

        .ce-select:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        .ce-select.error {
          border-color: #d07070;
        }

        .ce-error {
          font-size: 12px;
          color: #d07070;
          margin-top: 3px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ce-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* ── Actions ── */
        .ce-actions {
          display: flex;
          gap: 12px;
          padding-top: 8px;
        }

        .ce-btn {
          flex: 1;
          padding: 11px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          text-align: center;
          text-decoration: none;
        }

        .ce-btn-cancel {
          background: #fff;
          border: 1.5px solid #e8e0d5;
          color: #7d6550;
        }

        .ce-btn-cancel:hover {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .ce-btn-submit {
          background: linear-gradient(135deg, #c8a882, #b8916a);
          color: #fff;
        }

        .ce-btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(184,145,106,0.3);
        }

        .ce-btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .ce-card {
            padding: 20px;
          }

          .ce-grid {
            grid-template-columns: 1fr;
          }

          .ce-actions {
            flex-direction: column;
          }

          .ce-card-title {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .ce-card {
            padding: 16px;
          }
        }
      `}</style>

      <div className="ce-container">
        <Link href="/organizer/events" className="ce-back">
          <ChevronLeft size={16} />
          Quay lại danh sách
        </Link>

        <div className="ce-card">
          <h1 className="ce-card-title">✨ Tạo sự kiện mới</h1>
          <p className="ce-card-sub">
            Điền thông tin chi tiết về sự kiện của bạn
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="ce-form">
            {/* Title */}
            <div className="ce-field">
              <label className="ce-label">
                <FileText size={15} />
                Tên sự kiện <span className="required">*</span>
              </label>
              <input
                {...register("title")}
                placeholder="VD: Đêm nhạc mùa hè 2026"
                className={`ce-input ${errors.title ? "error" : ""}`}
              />
              {errors.title && (
                <span className="ce-error">• {errors.title.message}</span>
              )}
            </div>

            {/* Description */}
            <div className="ce-field">
              <label className="ce-label">
                <FileText size={15} />
                Mô tả
              </label>
              <textarea
                {...register("description")}
                placeholder="Mô tả chi tiết về sự kiện..."
                rows={4}
                className={`ce-input ce-textarea ${errors.description ? "error" : ""}`}
              />
            </div>

            {/* Category */}
            <div className="ce-field">
              <label className="ce-label">
                <Tag size={15} />
                Danh mục
              </label>
              <select
                {...register("categoryId")}
                className={`ce-select ${errors.categoryId ? "error" : ""}`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="ce-field">
              <label className="ce-label">
                <MapPin size={15} />
                Địa điểm <span className="required">*</span>
              </label>
              <input
                {...register("venueName")}
                placeholder="VD: Nhà hát lớn Hà Nội"
                className={`ce-input ${errors.venueName ? "error" : ""}`}
              />
              {errors.venueName && (
                <span className="ce-error">• {errors.venueName.message}</span>
              )}
            </div>

            <div className="ce-grid">
              <div className="ce-field">
                <label className="ce-label">
                  <MapPin size={15} />
                  Thành phố <span className="required">*</span>
                </label>
                <input
                  {...register("city")}
                  placeholder="VD: Hà Nội"
                  className={`ce-input ${errors.city ? "error" : ""}`}
                />
                {errors.city && (
                  <span className="ce-error">• {errors.city.message}</span>
                )}
              </div>
              <div className="ce-field">
                <label className="ce-label">
                  <MapPin size={15} />
                  Địa chỉ cụ thể <span className="required">*</span>
                </label>
                <input
                  {...register("address")}
                  placeholder="VD: 1 Tràng Tiền, Hoàn Kiếm"
                  className={`ce-input ${errors.address ? "error" : ""}`}
                />
                {errors.address && (
                  <span className="ce-error">• {errors.address.message}</span>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="ce-field">
              <label className="ce-label">
                <Calendar size={15} />
                Thời gian diễn ra <span className="required">*</span>
              </label>
              <div className="ce-grid">
                <div>
                  <input
                    {...register("startAt")}
                    type="datetime-local"
                    className={`ce-input ${errors.startAt ? "error" : ""}`}
                  />
                  {errors.startAt && (
                    <span className="ce-error">• {errors.startAt.message}</span>
                  )}
                </div>
                <div>
                  <input
                    {...register("endAt")}
                    type="datetime-local"
                    className={`ce-input ${errors.endAt ? "error" : ""}`}
                  />
                  {errors.endAt && (
                    <span className="ce-error">• {errors.endAt.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Sale time */}
            <div className="ce-field">
              <label className="ce-label">
                <Ticket size={15} />
                Thời gian bán vé <span className="required">*</span>
              </label>
              <div className="ce-grid">
                <div>
                  <input
                    {...register("saleStartAt")}
                    type="datetime-local"
                    className={`ce-input ${errors.saleStartAt ? "error" : ""}`}
                  />
                  {errors.saleStartAt && (
                    <span className="ce-error">
                      • {errors.saleStartAt.message}
                    </span>
                  )}
                </div>
                <div>
                  <input
                    {...register("saleEndAt")}
                    type="datetime-local"
                    className={`ce-input ${errors.saleEndAt ? "error" : ""}`}
                  />
                  {errors.saleEndAt && (
                    <span className="ce-error">
                      • {errors.saleEndAt.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="ce-actions">
              <Link href="/organizer/events" className="ce-btn ce-btn-cancel">
                Huỷ bỏ
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="ce-btn ce-btn-submit"
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                        verticalAlign: "middle",
                        marginRight: 8,
                      }}
                    />
                    Đang tạo...
                  </>
                ) : (
                  "✨ Tạo sự kiện"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
