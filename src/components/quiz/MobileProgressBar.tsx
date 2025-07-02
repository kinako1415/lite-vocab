import React from "react";
import styles from "./MobileProgressBar.module.scss";

interface MobileProgressBarProps {
  current: number;
  total: number;
  correctCount: number;
  incorrectCount: number;
  vagueCount: number;
}

export const MobileProgressBar: React.FC<MobileProgressBarProps> = ({
  current,
  total,
  correctCount,
  incorrectCount,
  vagueCount,
}) => {
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;
  const answeredCount = correctCount + incorrectCount + vagueCount;
  const accuracy =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const correctPercentage = total > 0 ? (correctCount / total) * 100 : 0;
  const incorrectPercentage = total > 0 ? (incorrectCount / total) * 100 : 0;
  const vaguePercentage = total > 0 ? (vagueCount / total) * 100 : 0;

  return (
    <div className={styles.progressContainer}>
      {/* ヘッダー情報 */}
      <div className={styles.progressHeader}>
        <div className={styles.progressInfo}>
          <span className={styles.progressText}>
            {current} / {total}
          </span>
          <span className={styles.remainingText}>
            残り {total - current} 語
          </span>
        </div>

        {answeredCount > 0 && (
          <div className={styles.accuracyInfo}>
            <span className={styles.accuracyText}>正解率 {accuracy}%</span>
          </div>
        )}
      </div>

      {/* メイン進捗バー */}
      <div className={styles.progressTrack}>
        {/* 回答済みの背景 */}
        <div className={styles.progressBase}>
          {/* 正解 */}
          <div
            className={styles.progressCorrect}
            style={{ width: `${correctPercentage}%` }}
          />
          {/* 不正解 */}
          <div
            className={styles.progressIncorrect}
            style={{
              width: `${incorrectPercentage}%`,
              left: `${correctPercentage}%`,
            }}
          />
          {/* あいまい */}
          <div
            className={styles.progressVague}
            style={{
              width: `${vaguePercentage}%`,
              left: `${correctPercentage + incorrectPercentage}%`,
            }}
          />
        </div>

        {/* 現在位置インジケーター */}
        <div
          className={styles.progressIndicator}
          style={{ left: `${progressPercentage}%` }}
        />
      </div>

      {/* 統計情報 */}
      <div className={styles.statsContainer}>
        <div className={styles.stat}>
          <span className={styles.statIcon}>✓</span>
          <span className={styles.statNumber}>{correctCount}</span>
          <span className={styles.statLabel}>わかる</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statIcon}>✗</span>
          <span className={styles.statNumber}>{incorrectCount}</span>
          <span className={styles.statLabel}>わからない</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statIcon}>~</span>
          <span className={styles.statNumber}>{vagueCount}</span>
          <span className={styles.statLabel}>あいまい</span>
        </div>
      </div>
    </div>
  );
};
