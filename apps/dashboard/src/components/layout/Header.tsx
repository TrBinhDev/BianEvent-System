"use client";

import { useAuthStore } from "@/stores/auth.store";
import { Bell } from "lucide-react";
import styles from "./Header.module.css";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className={styles.header}>
      {/* Tiêu đề trang */}
      <div>
        <h1 className={styles.title}>{title}</h1>
      </div>

      {/* Khu vực Action & Profile */}
      <div className={styles.actions}>
        {/* Nút thông báo */}
        <button className={styles.bellBtn} aria-label="Thông báo">
          <Bell size={17} />
          <span className={styles.bellDot} />
        </button>

        <div className={styles.divider} />

        {/* Thông tin User */}
        <div className={styles.user}>
          <div className={styles.userAvatar}>
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <span className={styles.userGreeting}>Xin chào, </span>
            <span className={styles.userName}>{user?.fullName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
