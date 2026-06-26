/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { eventService } from "@/services/event.service";
import { Category } from "@/types/event.types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    eventService.adminGetCategories().then((res) => {
      setCategories(res.data);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await eventService.adminCreateCategory(newName.trim());
      setCategories((prev) => [...prev, res.data]);
      setNewName("");
      toast.success("Đã thêm danh mục");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thêm thất bại");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await eventService.adminUpdateCategory(id, editingName.trim());
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c)),
      );
      setEditingId(null);
      toast.success("Đã cập nhật danh mục");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá danh mục này?")) return;
    try {
      await eventService.adminDeleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Đã xoá danh mục");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xoá thất bại");
    }
  };

  return (
    <>
      <style>{`
        /* ── Container full width ── */
        .cat-container {
          width: 100%;
        }

        /* ── Card chung ── */
        .cat-card {
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

        /* ── Add form ── */
        .cat-add-wrap {
          padding: 20px 24px 24px;
        }

        .cat-add-label {
          font-size: 13px;
          font-weight: 600;
          color: #3d2f1f;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cat-add-label svg {
          color: #c0a888;
        }

        .cat-add-row {
          display: flex;
          gap: 10px;
        }

        .cat-input {
          flex: 1;
          padding: 10px 16px;
          border: 1.5px solid #e8e0d5;
          border-radius: 10px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: inherit;
        }

        .cat-input::placeholder {
          color: #c8b89a;
        }

        .cat-input:focus {
          border-color: #c8a882;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.14);
        }

        .cat-btn-add {
          display: flex;
          align-items: center;
          gap: 8px;
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

        .cat-btn-add:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(184,145,106,0.3);
        }

        .cat-btn-add:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* ── List header ── */
        .cat-list-header {
          padding: 12px 24px;
          border-bottom: 1px solid #e8e0d5;
          background: #faf8f5;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cat-list-title {
          font-size: 11px;
          font-weight: 700;
          color: #c0a888;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .cat-list-count {
          font-size: 11px;
          font-weight: 600;
          color: #c0a888;
          background: #f0ebe3;
          padding: 2px 12px;
          border-radius: 99px;
        }

        /* ── Item ── */
        .cat-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          border-bottom: 1px solid #f0ebe3;
          transition: background 0.15s;
        }

        .cat-item:last-child {
          border-bottom: none;
        }

        .cat-item:hover {
          background: #faf8f5;
        }

        .cat-item-info {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          flex: 1;
        }

        .cat-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #faf8f5, #f0ebe3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #c0a888;
        }

        .cat-item-name {
          font-weight: 600;
          font-size: 13.5px;
          color: #3d2f1f;
        }

        .cat-item-slug {
          font-size: 12px;
          color: #a89070;
          margin-top: 1px;
        }

        /* ── Item actions ── */
        .cat-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
          margin-left: 12px;
        }

        .cat-btn-icon {
          padding: 6px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #a89070;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cat-btn-icon:hover {
          background: #f0ebe3;
        }

        .cat-btn-edit:hover {
          color: #b8916a;
        }

        .cat-btn-delete:hover {
          color: #d07070;
          background: #fce8e8;
        }

        /* ── Editing state ── */
        .cat-edit-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .cat-edit-input {
          flex: 1;
          padding: 8px 14px;
          border: 1.5px solid #c8a882;
          border-radius: 8px;
          background: #fff;
          color: #3d2f1f;
          font-size: 13.5px;
          font-weight: 500;
          outline: none;
          font-family: inherit;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.1);
        }

        .cat-edit-input:focus {
          box-shadow: 0 0 0 3px rgba(200,168,130,0.2);
        }

        .cat-btn-confirm {
          padding: 6px 10px;
          border: none;
          border-radius: 8px;
          background: #e8f5ef;
          color: #2e7d5a;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cat-btn-confirm:hover {
          background: #d0ece0;
        }

        .cat-btn-cancel {
          padding: 6px 10px;
          border: none;
          border-radius: 8px;
          background: #f0ebe3;
          color: #7d6550;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cat-btn-cancel:hover {
          background: #e8e0d5;
        }

        /* ── Skeleton ── */
        .cat-skeleton {
          height: 18px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f0ebe3 25%, #e8e0d5 50%, #f0ebe3 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
        }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .cat-skeleton-wrap {
          padding: 8px 24px;
        }

        .cat-skeleton-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid #f0ebe3;
        }

        .cat-skeleton-row:last-child {
          border-bottom: none;
        }

        .cat-skeleton-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .cat-skeleton-text {
          flex: 1;
        }

        .cat-skeleton-text .cat-skeleton {
          width: 60%;
          margin-bottom: 4px;
        }

        .cat-skeleton-text .cat-skeleton:last-child {
          width: 40%;
          height: 14px;
          margin-bottom: 0;
        }

        .cat-skeleton-actions {
          display: flex;
          gap: 4px;
        }

        .cat-skeleton-actions .cat-skeleton {
          width: 28px;
          height: 28px;
          border-radius: 8px;
        }

        /* ── Empty ── */
        .cat-empty {
          padding: 48px 24px;
          text-align: center;
          color: #c0a888;
          font-size: 14px;
        }

        .cat-empty-icon {
          margin-bottom: 12px;
          color: #e8e0d5;
        }

        .cat-empty-text {
          font-weight: 500;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .cat-add-row {
            flex-direction: column;
          }

          .cat-btn-add {
            justify-content: center;
          }

          .cat-item {
            flex-wrap: wrap;
            gap: 8px;
          }

          .cat-actions {
            margin-left: 50px;
          }
        }
      `}</style>

      <div className="cat-container">
        {/* Add new */}
        <div className="cat-card" style={{ animationDelay: "0.05s" }}>
          <div className="cat-add-wrap">
            <div className="cat-add-label">
              <Plus size={16} />
              Thêm danh mục mới
            </div>
            <div className="cat-add-row">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Nhập tên danh mục..."
                className="cat-input"
              />
              <button
                onClick={handleAdd}
                disabled={adding || !newName.trim()}
                className="cat-btn-add"
              >
                <Plus size={16} />
                Thêm
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div
          className="cat-card"
          style={{ animationDelay: "0.1s", marginTop: 16 }}
        >
          <div className="cat-list-header">
            <span className="cat-list-title">Danh sách danh mục</span>
            <span className="cat-list-count">{categories.length}</span>
          </div>

          {loading ? (
            <div className="cat-skeleton-wrap">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="cat-skeleton-row">
                  <div className="cat-skeleton-icon cat-skeleton" />
                  <div className="cat-skeleton-text">
                    <div className="cat-skeleton" />
                    <div className="cat-skeleton" />
                  </div>
                  <div className="cat-skeleton-actions">
                    <div className="cat-skeleton" />
                    <div className="cat-skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="cat-empty">
              <div className="cat-empty-icon">
                <Tag size={40} strokeWidth={1.5} />
              </div>
              <p className="cat-empty-text">Chưa có danh mục nào</p>
              <p style={{ fontSize: 12, color: "#d5c8b8", marginTop: 4 }}>
                Hãy thêm danh mục đầu tiên
              </p>
            </div>
          ) : (
            <div>
              {categories.map((cat) => (
                <div key={cat.id} className="cat-item">
                  {editingId === cat.id ? (
                    <div className="cat-edit-row">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleUpdate(cat.id)
                        }
                        autoFocus
                        className="cat-edit-input"
                      />
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="cat-btn-confirm"
                        title="Lưu"
                      >
                        <Check size={15} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="cat-btn-cancel"
                        title="Huỷ"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="cat-item-info">
                        <div className="cat-icon-wrap">
                          <Tag size={16} />
                        </div>
                        <div>
                          <div className="cat-item-name">{cat.name}</div>
                          <div className="cat-item-slug">/{cat.slug}</div>
                        </div>
                      </div>
                      <div className="cat-actions">
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditingName(cat.name);
                          }}
                          className="cat-btn-icon cat-btn-edit"
                          title="Sửa"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="cat-btn-icon cat-btn-delete"
                          title="Xoá"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
