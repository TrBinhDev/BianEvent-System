/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { eventService } from "@/services/event.service";
import { Category } from "@/types/event.types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./categories.module.css";

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
    <div className={styles.container}>
      {/* Add new */}
      <div className={styles.card} style={{ animationDelay: "0.05s" }}>
        <div className={styles.addWrap}>
          <div className={styles.addLabel}>
            <Plus size={16} />
            Thêm danh mục mới
          </div>
          <div className={styles.addRow}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Nhập tên danh mục..."
              className={styles.input}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className={styles.btnAdd}
            >
              <Plus size={16} />
              Thêm
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div
        className={styles.card}
        style={{ animationDelay: "0.1s", marginTop: 16 }}
      >
        <div className={styles.listHeader}>
          <span className={styles.listTitle}>Danh sách danh mục</span>
          <span className={styles.listCount}>{categories.length}</span>
        </div>

        {loading ? (
          <div className={styles.skeletonWrap}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonRow}>
                <div className={`${styles.skeletonIcon} ${styles.skeleton}`} />
                <div className={styles.skeletonText}>
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
        ) : categories.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Tag size={40} strokeWidth={1.5} />
            </div>
            <p className={styles.emptyText}>Chưa có danh mục nào</p>
            <p className={styles.emptySub}>Hãy thêm danh mục đầu tiên</p>
          </div>
        ) : (
          <div>
            {categories.map((cat) => (
              <div key={cat.id} className={styles.item}>
                {editingId === cat.id ? (
                  <div className={styles.editRow}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUpdate(cat.id)
                      }
                      autoFocus
                      className={styles.editInput}
                    />
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      className={styles.btnConfirm}
                      title="Lưu"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className={styles.btnCancel}
                      title="Huỷ"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.itemInfo}>
                      <div className={styles.iconWrap}>
                        <Tag size={16} />
                      </div>
                      <div>
                        <div className={styles.itemName}>{cat.name}</div>
                        <div className={styles.itemSlug}>/{cat.slug}</div>
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditingName(cat.name);
                        }}
                        className={`${styles.btnIcon} ${styles.btnEdit}`}
                        title="Sửa"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className={`${styles.btnIcon} ${styles.btnDelete}`}
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
  );
}
