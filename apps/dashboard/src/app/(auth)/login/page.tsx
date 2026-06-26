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

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAccessToken, setUser, isAdmin, isOrganizer } = useAuthStore();
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
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f1eb;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }

        /* Subtle background decoration */
        .login-page::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -120px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(200,168,130,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-page::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(184,145,106,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-wrap {
          width: 100%;
          max-width: 420px;
          animation: fade-in-up 0.4s ease both;
          position: relative;
          z-index: 1;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Logo area ── */
        .login-logo-area {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-logo-mark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .login-logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #c8a882, #b8916a);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          box-shadow: 0 4px 14px rgba(184,145,106,0.32);
        }

        .login-logo-name {
          font-size: 20px;
          font-weight: 800;
          color: #3d2f1f;
          letter-spacing: -0.01em;
        }

        .login-heading {
          font-size: 22px;
          font-weight: 700;
          color: #3d2f1f;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }

        .login-subheading {
          font-size: 13.5px;
          color: #a89070;
          margin: 0;
        }

        /* ── Card ── */
        .login-card {
          background: #fff;
          border: 1px solid #e8e0d5;
          border-radius: 18px;
          padding: 32px 28px;
          box-shadow: 0 4px 24px rgba(139,94,60,0.07);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* ── Field ── */
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-label {
          font-size: 13px;
          font-weight: 600;
          color: #5a3e28;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input {
          width: 100%;
          padding: 11px 16px;
          border: 1.5px solid #e8e0d5;
          border-radius: 11px;
          background: #faf8f5;
          color: #3d2f1f;
          font-size: 14px;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          font-family: inherit;
        }

        .login-input::placeholder {
          color: #c8b89a;
        }

        .login-input:focus {
          border-color: #c8a882;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(200,168,130,0.15);
        }

        .login-input.has-error {
          border-color: #d07070;
          background: #fef8f8;
        }

        .login-input.has-error:focus {
          box-shadow: 0 0 0 3px rgba(208,112,112,0.12);
        }

        .login-input-pw {
          padding-right: 44px;
        }

        .login-pw-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #c0a888;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .login-pw-toggle:hover {
          color: #8b5e3c;
        }

        .login-error-msg {
          font-size: 12px;
          color: #c05050;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* ── Submit ── */
        .login-submit {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #c8a882, #b8916a);
          color: #fff;
          border: none;
          border-radius: 11px;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
          margin-top: 4px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(184,145,106,0.35);
        }

        .login-submit::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.18s;
        }

        .login-submit:hover:not(:disabled)::after {
          background: rgba(255,255,255,0.08);
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(184,145,106,0.42);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(184,145,106,0.3);
        }

        .login-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .login-submit-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Divider ── */
        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }

        .login-divider-line {
          flex: 1;
          height: 1px;
          background: #e8e0d5;
        }

        .login-divider-text {
          font-size: 12px;
          color: #c0a888;
          white-space: nowrap;
        }

        /* ── Footer ── */
        .login-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: #a89070;
        }

        .login-footer a {
          color: #b8916a;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s;
        }

        .login-footer a:hover {
          color: #8b5e3c;
          text-decoration: underline;
        }

        /* ── Role badges ── */
        .login-roles {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        .login-role-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 99px;
          background: #f5ede0;
          color: #8b5e3c;
          border: 1px solid #e8d8c4;
        }
      `}</style>

      <div className="login-page">
        <div className="login-wrap">
          {/* Logo */}
          <div className="login-logo-area">
            <div className="login-logo-mark">
              <div className="login-logo-icon">B</div>
              <span className="login-logo-name">BianEvent</span>
            </div>
            <h1 className="login-heading">Đăng nhập</h1>
            <p className="login-subheading">
              Quản lý sự kiện & doanh thu của bạn
            </p>
            <div className="login-roles">
              <span className="login-role-badge">Admin</span>
              <span className="login-role-badge">Organizer</span>
            </div>
          </div>

          {/* Card */}
          <div className="login-card">
            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              {/* Email */}
              <div className="login-field">
                <label className="login-label">Email</label>
                <div className="login-input-wrap">
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className={`login-input${errors.email ? " has-error" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="login-error-msg">
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
              <div className="login-field">
                <label className="login-label">Mật khẩu</label>
                <div className="login-input-wrap">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`login-input login-input-pw${errors.password ? " has-error" : ""}`}
                  />
                  <button
                    type="button"
                    className="login-pw-toggle"
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
                  <p className="login-error-msg">
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
              <button type="submit" disabled={loading} className="login-submit">
                <span className="login-submit-inner">
                  {loading && <span className="login-spinner" />}
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="login-footer">
            Chỉ dành cho Organizer và Admin.{" "}
            <a href="http://localhost:4000">Về trang chính</a>
          </p>
        </div>
      </div>
    </>
  );
}
