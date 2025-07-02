import React from "react";
import styles from "./MobileHeader.module.scss";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  title?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  isLoading?: boolean;
  notifications?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  isMenuOpen,
  onMenuToggle,
  title = "LiteVocab",
  actions,
  showBackButton = false,
  onBackClick,
  isLoading = false,
  notifications = 0,
}) => {
  // 振動フィードバック（サポートされている場合）
  const handleVibration = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10); // 10msの軽い振動
    }
  };

  const handleMenuClick = () => {
    handleVibration();
    onMenuToggle();
  };

  const handleBackClick = () => {
    handleVibration();
    onBackClick?.();
  };

  return (
    <header className={styles.mobileHeader} role="banner">
      {/* 左側: メニューボタンまたは戻るボタン */}
      <div className={styles.leftSection}>
        {showBackButton ? (
          <button
            className={`${styles.navigationButton} ${styles.backButton}`}
            onClick={handleBackClick}
            aria-label="戻る"
            disabled={isLoading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <button
            className={`${styles.navigationButton} ${styles.menuButton} ${
              isMenuOpen ? styles.active : ""
            }`}
            onClick={handleMenuClick}
            aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={isMenuOpen}
            disabled={isLoading}
          >
            <div className={styles.hamburger}>
              <span className={styles.line}></span>
              <span className={styles.line}></span>
              <span className={styles.line}></span>
            </div>
            {notifications > 0 && (
              <span
                className={styles.notificationBadge}
                aria-label={`${notifications}件の通知`}
              >
                {notifications > 99 ? "99+" : notifications}
              </span>
            )}
          </button>
        )}
      </div>

      {/* 中央: タイトル */}
      <div className={styles.centerSection}>
        <h1 className={styles.title}>
          {isLoading ? (
            <span className={styles.loadingTitle}>
              <span className={styles.loadingDots}>...</span>
              {title}
            </span>
          ) : (
            title
          )}
        </h1>
      </div>

      {/* 右側: アクション */}
      <div className={styles.rightSection}>{actions}</div>
    </header>
  );
};
