/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { AdminUser } from "@/types/admin.types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

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
      <style>{`
        /* ── Filters ── */
        .uf-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .uf-search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .uf-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #c0a888;
          pointer-events: none;
        }

        .uf-input {
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

        .uf-input::placeholder { color: #c8b89a; }

        .uf-input:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        .uf-select {
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

        .uf-select:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        /* ── Table card ── */
        .uf-card {
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

        .uf-table {
          width: 100%;
          border-collapse: collapse;
        }

        /* ── Head ── */
        .uf-thead tr {
          background: #faf8f5;
          border-bottom: 1px solid #e8e0d5;
        }

        .uf-th {
          padding: 11px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #c0a888;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          white-space: nowrap;
        }

        /* ── Body ── */
        .uf-tr {
          border-bottom: 1px solid #f0ebe3;
          transition: background 0.15s;
        }

        .uf-tr:last-child { border-bottom: none; }

        .uf-tr:hover { background: #faf8f5; }

        .uf-td {
          padding: 12px 16px;
          font-size: 13.5px;
          color: #3d2f1f;
          vertical-align: middle;
        }

        /* Avatar + name */
        .uf-user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .uf-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c8a882, #b8916a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .uf-user-name {
          font-weight: 600;
          font-size: 13.5px;
          color: #3d2f1f;
          line-height: 1.2;
        }

        .uf-user-email {
          font-size: 12px;
          color: #a89070;
          margin-top: 1px;
        }

        /* Role select */
        .uf-role-select {
          padding: 5px 24px 5px 10px;
          border: 1.5px solid #e8e0d5;
          border-radius: 8px;
          background: #faf8f5;
          color: #5a3e28;
          font-size: 12.5px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          transition: border-color 0.18s;
          font-family: inherit;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23c0a888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
        }

        .uf-role-select:focus {
          border-color: #c8a882;
        }

        /* Status badges */
        .uf-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
        }

        .uf-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .uf-badge-active {
          background: #e8f5ef;
          color: #2e7d5a;
        }
        .uf-badge-active::before { background: #3a9e70; }

        .uf-badge-banned {
          background: #fce8e8;
          color: #b03030;
        }
        .uf-badge-banned::before { background: #d07070; }

        .uf-badge-unverified {
          background: #faf0e0;
          color: #a0692a;
        }
        .uf-badge-unverified::before { background: #c89040; }

        /* Action buttons */
        .uf-btn-unlock {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          background: #e8f5ef;
          color: #2e7d5a;
          border: 1px solid #c8e8d8;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .uf-btn-unlock:hover {
          background: #d0ece0;
          border-color: #a8d8b8;
        }

        .uf-btn-ban {
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

        .uf-btn-ban:hover {
          background: #f8d8d8;
          border-color: #e0a8a8;
        }

        /* Empty & loading */
        .uf-empty {
          padding: 48px 16px;
          text-align: center;
          color: #c0a888;
          font-size: 14px;
        }

        .uf-skeleton {
          height: 20px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f0ebe3 25%, #e8e0d5 50%, #f0ebe3 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
        }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        /* ── Pagination ── */
        .uf-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 14px 16px;
          border-top: 1px solid #e8e0d5;
        }

        .uf-page-btn {
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

        .uf-page-btn:hover:not(:disabled) {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .uf-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .uf-page-num {
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

        .uf-page-num:hover {
          border-color: #c8a882;
          color: #8b5e3c;
        }

        .uf-page-num.active {
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-color: transparent;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(184,145,106,0.3);
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .uf-filters {
            flex-direction: column;
          }
          
          .uf-search-wrap {
            min-width: 100%;
          }
          
          .uf-table {
            font-size: 12px;
          }
          
          .uf-th,
          .uf-td {
            padding: 8px 10px;
          }
        }

        @media (max-width: 480px) {
          .uf-user-cell {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .uf-avatar {
            width: 28px;
            height: 28px;
            font-size: 10px;
          }
        }
      `}</style>

      {/* Filters */}
      <div className="uf-filters">
        <div className="uf-search-wrap">
          <Search size={15} className="uf-search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="uf-input"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="uf-select"
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
          className="uf-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="UNVERIFIED">Chưa xác thực</option>
          <option value="BANNED">Đã khoá</option>
        </select>
      </div>

      {/* Table */}
      <div className="uf-card">
        <table className="uf-table">
          <thead className="uf-thead">
            <tr>
              <th className="uf-th">Người dùng</th>
              <th className="uf-th">Role</th>
              <th className="uf-th">Trạng thái</th>
              <th className="uf-th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="uf-tr">
                  <td className="uf-td" style={{ width: "40%" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        className="uf-skeleton"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          className="uf-skeleton"
                          style={{ width: "60%", marginBottom: 5 }}
                        />
                        <div
                          className="uf-skeleton"
                          style={{ width: "80%", height: 14 }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="uf-td">
                    <div className="uf-skeleton" style={{ width: 80 }} />
                  </td>
                  <td className="uf-td">
                    <div className="uf-skeleton" style={{ width: 70 }} />
                  </td>
                  <td className="uf-td">
                    <div className="uf-skeleton" style={{ width: 60 }} />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="uf-empty">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="uf-tr">
                  {/* User */}
                  <td className="uf-td">
                    <div className="uf-user-cell">
                      <div className="uf-avatar">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="uf-user-name">{user.fullName}</div>
                        <div className="uf-user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="uf-td">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleUpdateRole(user.id, e.target.value)
                      }
                      className="uf-role-select"
                    >
                      <option value="USER">User</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>

                  {/* Status */}
                  <td className="uf-td">
                    <span
                      className={`uf-badge ${
                        user.status === "ACTIVE"
                          ? "uf-badge-active"
                          : user.status === "BANNED"
                            ? "uf-badge-banned"
                            : "uf-badge-unverified"
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
                  <td className="uf-td">
                    {user.status === "BANNED" ? (
                      <button
                        className="uf-btn-unlock"
                        onClick={() => handleUpdateStatus(user.id, "ACTIVE")}
                      >
                        Mở khoá
                      </button>
                    ) : (
                      <button
                        className="uf-btn-ban"
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
          <div className="uf-pagination">
            <button
              className="uf-page-btn"
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
                className={`uf-page-num${p === page ? " active" : ""}`}
              >
                {p}
              </button>
            ))}
            <button
              className="uf-page-btn"
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
