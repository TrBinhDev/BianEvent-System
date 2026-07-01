"use client";

import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingLogo}>B</div>
      <div className={styles.loadingSpinnerWrap}>
        <div className={styles.loadingSpinnerTrack} />
        <div className={styles.loadingSpinner} />
      </div>
      <p className={styles.loadingText}>Đang tải dữ liệu hệ thống...</p>
    </div>
  );
}
// Dev by TrBinhDev