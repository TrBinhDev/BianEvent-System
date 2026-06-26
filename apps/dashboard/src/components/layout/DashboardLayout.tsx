"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  return (
    <div className={styles.root}>
      <Sidebar />

      <div className={styles.content}>
        <Header title={title} />
        <main className={styles.main}>
          <div className={styles.inner}>{children}</div>
        </main>
      </div>
    </div>
  );
}
