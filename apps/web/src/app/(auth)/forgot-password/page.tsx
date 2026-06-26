"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#F5E6D0] to-[var(--color-cream)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-2xl">
              <span className="text-[var(--color-text)]">Bian</span>
              <span className="text-[var(--color-primary)]">Event</span>
            </span>
          </Link>
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Quên mật khẩu
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2 text-sm">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-cream-dark)]">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✉️</div>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                Kiểm tra email của bạn
              </h2>
              <p className="text-[var(--color-text-muted)] text-sm">
                Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu
                trong vài phút.
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-[var(--color-primary)] font-medium hover:underline"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
              </button>

              <Link
                href="/login"
                className="text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                Quay lại đăng nhập
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
