import React, { useState } from "react";
import { QuizWord, AnswerType } from "@/types/quiz";
import { useQuizManager } from "@/hooks/useQuizManager";
import { IconButton } from "@/components/elements/IconButton";
import { WordCard } from "./WordCard";
import { QuizResults } from "./QuizResults";
import styles from "./QuizInterface.module.scss";

interface QuizInterfaceProps {
  words: QuizWord[];
  onExit: () => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  words,
  onExit,
}) => {
  const {
    currentWord,
    progress,
    remainingWords,
    isCompleted,
    answerWord,
    getResults,
    restart,
  } = useQuizManager(words);

  const [exitingCard, setExitingCard] = useState<{
    word: QuizWord;
    direction: AnswerType;
  } | null>(null);

  const [dragPreview, setDragPreview] = useState<{
    type: "know" | "unknown" | "vague" | null;
    show: boolean;
  }>({ type: null, show: false });

  const handleAnswer = (answerType: AnswerType) => {
    if (!currentWord) return;

    // カードの退場アニメーションを開始
    setExitingCard({
      word: currentWord,
      direction: answerType,
    });

    // アニメーション後に次の単語に進む
    setTimeout(() => {
      answerWord(answerType);
      setExitingCard(null);
    }, 300);
  };

  const handleDragPreview = (preview: {
    type: "know" | "unknown" | "vague" | null;
    show: boolean;
  }) => {
    // フリップ状態に関わらず、ドラッグプレビューを更新
    setDragPreview(preview);
  };

  // プログレスバーの幅を計算
  const progressPercent =
    progress.totalWords > 0
      ? (progress.currentIndex / progress.totalWords) * 100
      : 0;

  // 次のカードを取得（プレビュー用）
  const nextWord = words[progress.currentIndex + 1];

  if (isCompleted) {
    return (
      <QuizResults results={getResults()} onRestart={restart} onExit={onExit} />
    );
  }

  return (
    <div className={styles.quizContainer}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <IconButton
          url="https://api.iconify.design/heroicons:arrow-left-20-solid.svg?color=%23ffffff"
          onClick={onExit}
          color="purple"
        />
        <div className={styles.exitLabel}>終わるボタン</div>
      </div>

      {/* プログレスセクション */}
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={styles.progressStats}>
          <span>
            {progress.currentIndex + 1}/{progress.totalWords}語
          </span>
          <span>
            {remainingWords === 1 ? "ラスト" : `残り${remainingWords}語`}
          </span>
        </div>
        {/* 統計表示 */}
        <div className={styles.statsDisplay}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>✓</span>
            <span className={styles.statCount}>{getResults().knowCount}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>✗</span>
            <span className={styles.statCount}>
              {getResults().unknownCount}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>?</span>
            <span className={styles.statCount}>{getResults().vagueCount}</span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className={styles.mainContent}>
        {/* カードスタック */}
        <div className={styles.cardStack}>
          {/* 次のカード（背景） */}
          {nextWord && (
            <div className={`${styles.cardContainer} ${styles.nextCard}`}>
              <WordCard
                word={nextWord}
                onAnswer={() => {}} // 次のカードは操作できない
                isNextCard={true}
              />
            </div>
          )}

          {/* 現在のカード */}
          {currentWord && (
            <div className={`${styles.cardContainer} ${styles.currentCard}`}>
              <WordCard
                word={currentWord}
                onAnswer={handleAnswer}
                onDragPreview={handleDragPreview}
                isExiting={exitingCard?.word.id === currentWord.id}
                exitDirection={exitingCard?.direction}
              />
            </div>
          )}
        </div>
      </div>

      {/* 画面全体のドラッグプレビュー */}
      {dragPreview.show && (
        <div className={styles.globalDragPreview}>
          {dragPreview.type === "know" && "わかる 😎"}
          {dragPreview.type === "unknown" && "わからない 😩"}
          {dragPreview.type === "vague" && "あいまい ❓"}
        </div>
      )}
    </div>
  );
};
