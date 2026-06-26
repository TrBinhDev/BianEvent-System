/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, Building2, LogOut } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { disconnectSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  avatarUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
    newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

const organizerSchema = z.object({
  organization: z.string().min(2, "Tên tổ chức tối thiểu 2 ký tự"),
  description: z.string().optional(),
  contactPhone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type OrganizerForm = z.infer<typeof organizerSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "organizer"
  >("profile");
  const [loading, setLoading] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const organizerForm = useForm<OrganizerForm>({
    resolver: zodResolver(organizerSchema),
  });

  const handleUpdateProfile = async (data: ProfileForm) => {
    setLoading(true);
    try {
      const res = await authService.updateProfile({
        fullName: data.fullName,
        avatarUrl: data.avatarUrl || undefined,
      });
      setUser(res.data);
      toast.success("Cập nhật thông tin thành công");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (data: PasswordForm) => {
    setLoading(true);
    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOrganizer = async (data: OrganizerForm) => {
    setLoading(true);
    try {
      await authService.applyOrganizer(data);
      toast.success("Đã gửi đơn đăng ký Organizer, vui lòng chờ duyệt");
      organizerForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gửi đơn thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      disconnectSocket();
      router.push("/");
      toast.success("Đã đăng xuất");
    }
  };

  const tabs = [
    { key: "profile", label: "Thông tin", icon: User },
    { key: "password", label: "Mật khẩu", icon: Lock },
    ...(user?.role === "USER"
      ? [{ key: "organizer", label: "Trở thành Organizer", icon: Building2 }]
      : []),
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[var(--color-cream-dark)] rounded-full flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                className="w-full h-full object-cover"
                alt={user.fullName}
              />
            ) : (
              <User size={28} className="text-[var(--color-text-muted)]" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">
              {user?.fullName}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {user?.email}
            </p>
            <span className="text-xs bg-[var(--color-cream-dark)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-full mt-1 inline-block">
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--color-cream-dark)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-6 border border-[var(--color-cream-dark)]">
        {/* Profile tab */}
        {activeTab === "profile" && (
          <form
            onSubmit={profileForm.handleSubmit(handleUpdateProfile)}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
                Họ và tên
              </label>
              <input
                {...profileForm.register("fullName")}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              {profileForm.formState.errors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {profileForm.formState.errors.fullName.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
                URL Avatar
              </label>
              <input
                {...profileForm.register("avatarUrl")}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        )}

        {/* Password tab */}
        {activeTab === "password" && (
          <form
            onSubmit={passwordForm.handleSubmit(handleChangePassword)}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
                Mật khẩu cũ
              </label>
              <input
                {...passwordForm.register("oldPassword")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              {passwordForm.formState.errors.oldPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordForm.formState.errors.oldPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
                Mật khẩu mới
              </label>
              <input
                {...passwordForm.register("newPassword")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <input
                {...passwordForm.register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </form>
        )}

        {/* Organizer tab */}
        {activeTab === "organizer" && (
          <form
            onSubmit={organizerForm.handleSubmit(handleApplyOrganizer)}
            className="flex flex-col gap-5"
          >
            <div className="bg-[var(--color-cream)] rounded-xl p-4 mb-2">
              <p className="text-sm text-[var(--color-text-muted)]">
                Trở thành Organizer để tạo và quản lý sự kiện của riêng bạn trên
                BianEvent. Đơn sẽ được Admin xem xét trong vòng 24 giờ.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
                Tên tổ chức
              </label>
              <input
                {...organizerForm.register("organization")}
                placeholder="Công ty Tổ chức Sự kiện ABC"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              {organizerForm.formState.errors.organization && (
                <p className="text-red-500 text-xs mt-1">
                  {organizerForm.formState.errors.organization.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
                Mô tả
              </label>
              <textarea
                {...organizerForm.register("description")}
                placeholder="Mô tả về tổ chức của bạn..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
                Số điện thoại liên hệ
              </label>
              <input
                {...organizerForm.register("contactPhone")}
                placeholder="0901234567"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi đơn đăng ký"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
