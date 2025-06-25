import React, { useState } from "react";
import { QuizWord, AnswerType } from "@/types/quiz";
import { useQuizManager } from "@/hooks/useQuizManager";
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
        <button className={styles.backButton} onClick={onExit} type="button">
          <svg
            className={styles.backIcon}
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 26L14 18L22 10"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
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
          <span>残り{remainingWords}語</span>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className={styles.mainContent}>
        {/* スワイプヒント */}
        <div className={styles.swipeHints}>
          <div className={styles.swipeHintLeft}>わからない</div>
          <div className={styles.swipeHintRight}>わかる</div>
          <div className={styles.swipeHintDown}>あいまい</div>
        </div>

        {/* カードスタック */}
        <div className={styles.cardStack}>
          {/* 次のカード（背景） */}
          {nextWord && (
            <div className={`${styles.cardContainer} ${styles.nextCard}`}>
              <WordCard
                word={nextWord}
                onAnswer={() => {}} // 次のカードは操作できない
              />
            </div>
          )}

          {/* 現在のカード */}
          {currentWord && (
            <div className={`${styles.cardContainer} ${styles.currentCard}`}>
              <WordCard
                word={currentWord}
                onAnswer={handleAnswer}
                isExiting={exitingCard?.word.id === currentWord.id}
                exitDirection={exitingCard?.direction}
              />
            </div>
          )}
        </div>

        {/* 操作説明ラベル */}
        <div className={styles.instructionLabels}>
          <div className={styles.instructionLabel}>音声再生</div>
          <div className={styles.instructionLabel}>右か左にドラッグで回答</div>
        </div>
      </div>
    </div>
  );
};
