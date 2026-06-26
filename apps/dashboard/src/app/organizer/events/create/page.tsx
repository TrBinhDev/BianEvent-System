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
  Ticket,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "./create.module.css";

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
    <div className={styles.container}>
      <Link href="/organizer/events" className={styles.back}>
        <ChevronLeft size={16} />
        Quay lại danh sách
      </Link>

      <div className={styles.card}>
        <h1 className={styles.cardTitle}>✨ Tạo sự kiện mới</h1>
        <p className={styles.cardSub}>
          Điền thông tin chi tiết về sự kiện của bạn
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label}>
              <FileText size={15} />
              Tên sự kiện <span className={styles.required}>*</span>
            </label>
            <input
              {...register("title")}
              placeholder="VD: Đêm nhạc mùa hè 2026"
              className={`${styles.input} ${errors.title ? styles.error : ""}`}
            />
            {errors.title && (
              <span className={styles.errorMsg}>• {errors.title.message}</span>
            )}
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>
              <FileText size={15} />
              Mô tả
            </label>
            <textarea
              {...register("description")}
              placeholder="Mô tả chi tiết về sự kiện..."
              rows={4}
              className={`${styles.input} ${styles.textarea} ${errors.description ? styles.error : ""}`}
            />
          </div>

          {/* Category */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Tag size={15} />
              Danh mục
            </label>
            <select
              {...register("categoryId")}
              className={`${styles.select} ${errors.categoryId ? styles.error : ""}`}
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
          <div className={styles.field}>
            <label className={styles.label}>
              <MapPin size={15} />
              Địa điểm <span className={styles.required}>*</span>
            </label>
            <input
              {...register("venueName")}
              placeholder="VD: Nhà hát lớn Hà Nội"
              className={`${styles.input} ${errors.venueName ? styles.error : ""}`}
            />
            {errors.venueName && (
              <span className={styles.errorMsg}>
                • {errors.venueName.message}
              </span>
            )}
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>
                <MapPin size={15} />
                Thành phố <span className={styles.required}>*</span>
              </label>
              <input
                {...register("city")}
                placeholder="VD: Hà Nội"
                className={`${styles.input} ${errors.city ? styles.error : ""}`}
              />
              {errors.city && (
                <span className={styles.errorMsg}>• {errors.city.message}</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <MapPin size={15} />
                Địa chỉ cụ thể <span className={styles.required}>*</span>
              </label>
              <input
                {...register("address")}
                placeholder="VD: 1 Tràng Tiền, Hoàn Kiếm"
                className={`${styles.input} ${errors.address ? styles.error : ""}`}
              />
              {errors.address && (
                <span className={styles.errorMsg}>
                  • {errors.address.message}
                </span>
              )}
            </div>
          </div>

          {/* Time */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Calendar size={15} />
              Thời gian diễn ra <span className={styles.required}>*</span>
            </label>
            <div className={styles.grid}>
              <div>
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
              <div>
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
          </div>

          {/* Sale time */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Ticket size={15} />
              Thời gian bán vé <span className={styles.required}>*</span>
            </label>
            <div className={styles.grid}>
              <div>
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
              <div>
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
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Link
              href="/organizer/events"
              className={`${styles.btn} ${styles.btnCancel}`}
            >
              Huỷ bỏ
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`${styles.btn} ${styles.btnSubmit}`}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
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
  );
}
