import React from "react";
import { QuizResult } from "@/types/quiz";
import styles from "./QuizResults.module.scss";

interface QuizResultsProps {
  results: QuizResult;
  onRestart: () => void;
  onExit: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  results,
  onRestart,
  onExit,
}) => {
  const { totalWords, knowCount, unknownCount, vagueCount } = results;

  // 円グラフの描画のためのパラメータ
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  // 各セクションの角度を計算
  const knowPercent = (knowCount / totalWords) * 100;
  const unknownPercent = (unknownCount / totalWords) * 100;
  const vaguePercent = (vagueCount / totalWords) * 100;

  const knowAngle = (knowCount / totalWords) * 360;
  const unknownAngle = (unknownCount / totalWords) * 360;
  const vagueAngle = (vagueCount / totalWords) * 360;

  // SVGパスを生成する関数
  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      centerX,
      centerY,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // 各セクションのパスを計算
  let currentAngle = 0;
  const knowPath =
    knowCount > 0 ? createPath(currentAngle, currentAngle + knowAngle) : "";
  currentAngle += knowAngle;

  const unknownPath =
    unknownCount > 0
      ? createPath(currentAngle, currentAngle + unknownAngle)
      : "";
  currentAngle += unknownAngle;

  const vaguePath =
    vagueCount > 0 ? createPath(currentAngle, currentAngle + vagueAngle) : "";

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsCard}>
        <h1 className={styles.title}>学習結果</h1>

        <div className={styles.chartContainer}>
          <div className={styles.chart}>
            <svg className={styles.chartSvg} viewBox="0 0 300 300">
              {/* 背景の円 */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                className={styles.chartBackground}
              />

              {/* 各セクション */}
              {knowCount > 0 && (
                <path d={knowPath} className={styles.chartKnow} />
              )}
              {unknownCount > 0 && (
                <path d={unknownPath} className={styles.chartUnknown} />
              )}
              {vagueCount > 0 && (
                <path d={vaguePath} className={styles.chartVague} />
              )}
            </svg>

            <div className={styles.chartCenter}>
              <span className={styles.chartCenterNumber}>{totalWords}</span>
              <div className={styles.chartCenterLabel}>総単語数</div>
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={`${styles.statNumber} ${styles.statNumberKnow}`}>
              {knowCount}
            </div>
            <div className={styles.statLabel}>わかる</div>
            <div className={styles.statLabel}>({knowPercent.toFixed(1)}%)</div>
          </div>

          <div className={styles.statItem}>
            <div className={`${styles.statNumber} ${styles.statNumberUnknown}`}>
              {unknownCount}
            </div>
            <div className={styles.statLabel}>わからない</div>
            <div className={styles.statLabel}>
              ({unknownPercent.toFixed(1)}%)
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={`${styles.statNumber} ${styles.statNumberVague}`}>
              {vagueCount}
            </div>
            <div className={styles.statLabel}>あいまい</div>
            <div className={styles.statLabel}>({vaguePercent.toFixed(1)}%)</div>
          </div>
        </div>

        <div className={styles.actionsContainer}>
          <button
            className={`${styles.actionButton} ${styles.primaryButton}`}
            onClick={onRestart}
          >
            もう一度
          </button>
          <button
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            onClick={onExit}
          >
            終了
          </button>
        </div>
      </div>
    </div>
  );
};
