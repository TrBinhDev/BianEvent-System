/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";
import styles from "./login.module.css";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAccessToken, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      setAccessToken(res.accessToken);

      const me = await authService.getMe();
      setUser(me.data);

      if (me.data.role !== "ORGANIZER" && me.data.role !== "ADMIN") {
        toast.error("Bạn không có quyền truy cập dashboard");
        return;
      }

      toast.success("Đăng nhập thành công!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginWrap}>
        {/* Logo */}
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>
            <div className={styles.logoIcon}>B</div>
            <span className={styles.logoName}>BianEvent</span>
          </div>
          <h1 className={styles.heading}>Đăng nhập</h1>
          <p className={styles.subheading}>
            Quản lý sự kiện & doanh thu của bạn
          </p>
          <div className={styles.roles}>
            <span className={styles.roleBadge}>Admin</span>
            <span className={styles.roleBadge}>Organizer</span>
          </div>
        </div>

        {/* Card */}
        <div className={styles.card}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <div className={styles.inputWrap}>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={`${styles.input}${errors.email ? ` ${styles.hasError}` : ""}`}
                />
              </div>
              {errors.email && (
                <p className={styles.errorMsg}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5.5" stroke="#c05050" />
                    <path
                      d="M6 3.5V6.5"
                      stroke="#c05050"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <circle cx="6" cy="8.5" r="0.6" fill="#c05050" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label className={styles.label}>Mật khẩu</label>
              <div className={styles.inputWrap}>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`${styles.input} ${styles.inputPw}${errors.password ? ` ${styles.hasError}` : ""}`}
                />
                <button
                  type="button"
                  className={styles.pwToggle}
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className={styles.errorMsg}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5.5" stroke="#c05050" />
                    <path
                      d="M6 3.5V6.5"
                      stroke="#c05050"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <circle cx="6" cy="8.5" r="0.6" fill="#c05050" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className={styles.submit}>
              <span className={styles.submitInner}>
                {loading && <span className={styles.spinner} />}
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          Chỉ dành cho Organizer và Admin.{" "}
          <a href="http://localhost:4000">Về trang chính</a>
        </p>
      </div>
    </div>
  );
}
