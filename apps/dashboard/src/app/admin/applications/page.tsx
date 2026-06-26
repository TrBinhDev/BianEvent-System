/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { OrganizerApplication } from "@/types/admin.types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";
import styles from "./applications.module.css";

const STATUS_CONFIG = {
  PENDING: { label: "Chờ duyệt", color: styles.badgePending },
  APPROVED: { label: "Đã duyệt", color: styles.badgeApproved },
  REJECTED: { label: "Từ chối", color: styles.badgeRejected },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<OrganizerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await adminService.getApplications({
          page,
          limit: 10,
          status: statusFilter || undefined,
        });
        setApplications(res.data);
        setTotalPages(res.pagination.totalPages);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [page, statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveApplication(id);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "APPROVED" } : a)),
      );
      toast.success("Đã duyệt đơn Organizer");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Từ chối đơn này?")) return;
    try {
      await adminService.rejectApplication(id);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "REJECTED" } : a)),
      );
      toast.success("Đã từ chối đơn");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại");
    }
  };

  const pendingCount = applications.filter(
    (a) => a.status === "PENDING",
  ).length;
  const approvedCount = applications.filter(
    (a) => a.status === "APPROVED",
  ).length;
  const rejectedCount = applications.filter(
    (a) => a.status === "REJECTED",
  ).length;

  return (
    <div className={styles.container}>
      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <Clock size={14} />
            Chờ duyệt
          </div>
          <div className={styles.statValue} style={{ color: "#a0692a" }}>
            {pendingCount}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <CheckCircle size={14} />
            Đã duyệt
          </div>
          <div className={styles.statValue} style={{ color: "#2e7d5a" }}>
            {approvedCount}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <XCircle size={14} />
            Từ chối
          </div>
          <div className={styles.statValue} style={{ color: "#b03030" }}>
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`${styles.filterBtn}${statusFilter === s ? ` ${styles.active}` : ""}`}
          >
            {s === "PENDING"
              ? "⏳ Chờ duyệt"
              : s === "APPROVED"
                ? "✅ Đã duyệt"
                : s === "REJECTED"
                  ? "❌ Từ chối"
                  : "📋 Tất cả"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonRow}>
                <div className={`${styles.skeletonIcon} ${styles.skeleton}`} />
                <div className={styles.skeletonText}>
                  <div className={styles.skeleton} />
                  <div className={styles.skeleton} />
                </div>
              </div>
              <div className={styles.skeletonDetail}>
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
              </div>
              <div className={styles.skeletonActions}>
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <p className={styles.emptyText}>Không có đơn đăng ký nào</p>
          <p className={styles.emptySub}>
            {statusFilter === "PENDING"
              ? "Không có đơn nào đang chờ duyệt"
              : statusFilter === "APPROVED"
                ? "Không có đơn nào đã được duyệt"
                : statusFilter === "REJECTED"
                  ? "Không có đơn nào bị từ chối"
                  : "Chưa có đơn đăng ký nào được gửi"}
          </p>
        </div>
      ) : (
        <div>
          {applications.map((app) => (
            <div key={app.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardLeft}>
                  <div className={styles.cardTitleWrap}>
                    <div className={styles.orgIcon}>
                      <Building2 size={20} />
                    </div>
                    <span className={styles.orgName}>{app.organization}</span>
                    <span
                      className={`${styles.badge} ${STATUS_CONFIG[app.status].color}`}
                    >
                      {STATUS_CONFIG[app.status].label}
                    </span>
                  </div>

                  <div className={styles.details}>
                    <div className={styles.detailItem}>
                      <User size={15} />
                      <span className={styles.value}>{app.user?.fullName}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Mail size={15} />
                      <span className={styles.value}>{app.user?.email}</span>
                    </div>
                    {app.contactPhone && (
                      <div className={styles.detailItem}>
                        <Phone size={15} />
                        <span className={styles.value}>{app.contactPhone}</span>
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <Calendar size={15} />
                      <span className={styles.label}>Gửi lúc </span>
                      <span className={styles.value}>
                        {format(new Date(app.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>

                  {app.description && (
                    <div className={styles.description}>{app.description}</div>
                  )}
                </div>

                {app.status === "PENDING" && (
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleApprove(app.id)}
                      className={`${styles.btn} ${styles.btnApprove}`}
                    >
                      <CheckCircle size={16} />
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      className={`${styles.btn} ${styles.btnReject}`}
                    >
                      <XCircle size={16} />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={15} />
            Trước
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
            Sau
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
