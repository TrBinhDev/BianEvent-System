/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length < 6) {
      toast.error("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyEmail({ userId, otp: otpString });
      toast.success("Xác thực email thành công!");
      router.push("/login");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "OTP không đúng hoặc đã hết hạn",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOtp(userId);
      toast.success("Đã gửi lại OTP, vui lòng kiểm tra email");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gửi lại OTP thất bại");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#F5E6D0] to-[var(--color-cream)]">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Xác thực email
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2 text-sm">
            Chúng tôi đã gửi mã OTP 6 số đến email của bạn.
            <br />
            Vui lòng kiểm tra và nhập mã bên dưới.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-cream-dark)]">
          {/* OTP inputs */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text)]"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join("").length < 6}
            className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 mb-4"
          >
            {loading ? "Đang xác thực..." : "Xác thực"}
          </button>

          <div className="text-center">
            <p className="text-[var(--color-text-muted)] text-sm">
              Không nhận được mã?{" "}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-[var(--color-primary)] font-medium hover:underline disabled:opacity-50"
              >
                {resending ? "Đang gửi..." : "Gửi lại"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
