/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { AdminUser } from "@/types/admin.types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./users.module.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await adminService.getUsers({
          page,
          limit: 10,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        });
        setUsers(res.data);
        setTotalPages(res.pagination.totalPages);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      await adminService.updateUserRole(id, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: role as any } : u)),
      );
      toast.success("Cập nhật role thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateUserStatus(id, status);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: status as any } : u)),
      );
      toast.success(
        status === "BANNED" ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản",
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.input}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className={styles.select}
        >
          <option value="">Tất cả role</option>
          <option value="USER">User</option>
          <option value="ORGANIZER">Organizer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className={styles.select}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="UNVERIFIED">Chưa xác thực</option>
          <option value="BANNED">Đã khoá</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.card}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Người dùng</th>
              <th className={styles.th}>Role</th>
              <th className={styles.th}>Trạng thái</th>
              <th className={styles.th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.td} style={{ width: "40%" }}>
                    <div className={styles.skeletonUserCell}>
                      <div
                        className={styles.skeleton}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          className={styles.skeleton}
                          style={{ width: "60%", marginBottom: 5 }}
                        />
                        <div
                          className={styles.skeleton}
                          style={{ width: "80%", height: 14 }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeleton} style={{ width: 80 }} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeleton} style={{ width: 70 }} />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.skeleton} style={{ width: 60 }} />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className={styles.tr}>
                  {/* User */}
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.userName}>{user.fullName}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className={styles.td}>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleUpdateRole(user.id, e.target.value)
                      }
                      className={styles.roleSelect}
                    >
                      <option value="USER">User</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>

                  {/* Status */}
                  <td className={styles.td}>
                    <span
                      className={`${styles.badge} ${
                        user.status === "ACTIVE"
                          ? styles.badgeActive
                          : user.status === "BANNED"
                            ? styles.badgeBanned
                            : styles.badgeUnverified
                      }`}
                    >
                      {user.status === "ACTIVE"
                        ? "Hoạt động"
                        : user.status === "BANNED"
                          ? "Đã khoá"
                          : "Chưa xác thực"}
                    </span>
                  </td>

                  {/* Action */}
                  <td className={styles.td}>
                    {user.status === "BANNED" ? (
                      <button
                        className={styles.btnUnlock}
                        onClick={() => handleUpdateStatus(user.id, "ACTIVE")}
                      >
                        Mở khoá
                      </button>
                    ) : (
                      <button
                        className={styles.btnBan}
                        onClick={() => handleUpdateStatus(user.id, "BANNED")}
                      >
                        Khoá
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
    </>
  );
}
