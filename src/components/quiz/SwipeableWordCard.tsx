import React, { useState, useRef } from "react";
import { QuizWord, AnswerType } from "@/types/quiz";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import styles from "./SwipeableWordCard.module.scss";

interface SwipeableWordCardProps {
  word: QuizWord;
  onAnswer: (answer: AnswerType) => void;
  isExiting?: boolean;
  exitDirection?: AnswerType;
  isNextCard?: boolean;
}

export const SwipeableWordCard: React.FC<SwipeableWordCardProps> = ({
  word,
  onAnswer,
  isExiting = false,
  exitDirection,
  isNextCard = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<
    "left" | "right" | "up" | "down" | null
  >(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 振動フィードバック
  const vibrate = (pattern: number | number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // スワイプジェスチャーの設定
  const { handlers } = useSwipeGesture({
    onSwipeLeft: () => {
      if (isNextCard) return;
      setSwipeDirection("left");
      vibrate(50);
      setTimeout(() => {
        onAnswer("unknown");
        setSwipeDirection(null);
        setIsFlipped(false);
      }, 200);
    },
    onSwipeRight: () => {
      if (isNextCard) return;
      setSwipeDirection("right");
      vibrate([30, 20, 30]);
      setTimeout(() => {
        onAnswer("know");
        setSwipeDirection(null);
        setIsFlipped(false);
      }, 200);
    },
    onSwipeDown: () => {
      if (isNextCard) return;
      setSwipeDirection("down");
      vibrate(40);
      setTimeout(() => {
        onAnswer("vague");
        setSwipeDirection(null);
        setIsFlipped(false);
      }, 200);
    },
  });

  const { onTouchStart, onTouchMove, onTouchEnd } = handlers;

  const handleFlip = () => {
    if (isNextCard) return;
    vibrate(25);
    setIsFlipped(!isFlipped);
  };

  const handleCardClick = () => {
    if (isNextCard) return;
    handleFlip();
  };

  const getCardClasses = () => {
    let classes = `${styles.card} ${
      isNextCard ? styles.nextCard : styles.currentCard
    }`;

    if (isFlipped) classes += ` ${styles.flipped}`;
    if (isExiting && exitDirection)
      classes += ` ${styles.exiting} ${styles[exitDirection]}`;
    if (swipeDirection)
      classes += ` ${styles.swiping} ${styles[swipeDirection]}`;

    return classes;
  };

  return (
    <div
      ref={cardRef}
      className={styles.cardContainer}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={getCardClasses()} onClick={handleCardClick}>
        {/* フロント面 */}
        <div className={styles.cardFront}>
          <div className={styles.cardContent}>
            <div className={styles.wordHeader}>
              <span className={styles.wordType}>
                {word.partOfSpeech || "単語"}
              </span>
              <button
                className={styles.speakButton}
                onClick={() => {
                  if ("speechSynthesis" in window) {
                    const utterance = new SpeechSynthesisUtterance(word.word);
                    utterance.lang = "en-US";
                    utterance.rate = 0.8;
                    speechSynthesis.speak(utterance);
                    vibrate(20);
                  }
                }}
                aria-label="単語を読み上げ"
              >
                🔊
              </button>
            </div>

            <h1 className={styles.word}>{word.word}</h1>

            <button
              className={styles.flipButton}
              onClick={handleFlip}
              aria-label="カードを裏返す"
            >
              <span className={styles.flipIcon}>↕️</span>
              意味を見る
            </button>
          </div>

          {/* スワイプヒント */}
          {!isNextCard && (
            <div className={styles.swipeHints}>
              <div className={styles.hintLeft}>
                <span className={styles.hintIcon}>👈</span>
                <span className={styles.hintText}>わからない</span>
              </div>
              <div className={styles.hintRight}>
                <span className={styles.hintIcon}>👉</span>
                <span className={styles.hintText}>わかる</span>
              </div>
              <div className={styles.hintDown}>
                <span className={styles.hintIcon}>👇</span>
                <span className={styles.hintText}>あいまい</span>
              </div>
            </div>
          )}
        </div>

        {/* バック面 */}
        <div className={styles.cardBack}>
          <div className={styles.cardContent}>
            <div className={styles.meaningHeader}>
              <span className={styles.meaningLabel}>意味</span>
              <button
                className={styles.speakButton}
                onClick={() => {
                  if ("speechSynthesis" in window) {
                    const utterance = new SpeechSynthesisUtterance(
                      word.meaning
                    );
                    utterance.lang = "ja-JP";
                    utterance.rate = 0.8;
                    speechSynthesis.speak(utterance);
                    vibrate(20);
                  }
                }}
                aria-label="意味を読み上げ"
              >
                🔊
              </button>
            </div>

            <h2 className={styles.meaning}>{word.meaning}</h2>

            <button
              className={styles.flipButton}
              onClick={handleFlip}
              aria-label="カードを表に戻す"
            >
              <span className={styles.flipIcon}>↕️</span>
              単語に戻る
            </button>
          </div>

          {/* スワイプヒント */}
          {!isNextCard && (
            <div className={styles.swipeHints}>
              <div className={styles.hintLeft}>
                <span className={styles.hintIcon}>👈</span>
                <span className={styles.hintText}>わからない</span>
              </div>
              <div className={styles.hintRight}>
                <span className={styles.hintIcon}>👉</span>
                <span className={styles.hintText}>わかる</span>
              </div>
              <div className={styles.hintDown}>
                <span className={styles.hintIcon}>👇</span>
                <span className={styles.hintText}>あいまい</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
