import React, { useState } from "react";
import { QuizWord, AnswerType } from "@/types/quiz";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import styles from "./WordCard.module.scss";

interface WordCardProps {
  word: QuizWord;
  onAnswer: (answerType: AnswerType) => void;
  isExiting?: boolean;
  exitDirection?: AnswerType;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  onAnswer,
  isExiting = false,
  exitDirection,
}) => {
  const [showMeaning, setShowMeaning] = useState(false);

  const { dragOffset, isDragging, swipeDirection, handlers } = useSwipeGesture({
    onSwipeLeft: () => onAnswer("unknown"),
    onSwipeRight: () => onAnswer("know"),
    onSwipeDown: () => onAnswer("vague"),
  });

  const handleToggleMeaning = () => {
    setShowMeaning(!showMeaning);
  };

  const handleSpeakWord = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    }
  };

  const getCardClassName = () => {
    let className = styles.wordCard;

    if (isDragging) {
      className += ` ${styles.dragging}`;
    }

    if (swipeDirection) {
      className += ` ${styles.swipePreview}`;

      switch (swipeDirection) {
        case "know":
          className += ` ${styles.swipeKnow}`;
          break;
        case "unknown":
          className += ` ${styles.swipeUnknown}`;
          break;
        case "vague":
          className += ` ${styles.swipeVague}`;
          break;
      }
    }

    if (isExiting && exitDirection) {
      className += ` ${styles.cardExit}`;

      switch (exitDirection) {
        case "know":
          className += ` ${styles.cardExitKnow}`;
          break;
        case "unknown":
          className += ` ${styles.cardExitUnknown}`;
          break;
        case "vague":
          className += ` ${styles.cardExitVague}`;
          break;
      }
    }

    return className;
  };

  const cardStyle = isDragging
    ? {
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${
          dragOffset.x * 0.1
        }deg)`,
      }
    : {};

  return (
    <div className={getCardClassName()} style={cardStyle} {...handlers}>
      <div className={styles.cardContent}>
        <button
          className={styles.speakerButton}
          onClick={handleSpeakWord}
          type="button"
        >
          <svg
            width="38"
            height="38"
            viewBox="0 0 39 39"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.speakerIcon}
          >
            <path
              d="M16.25 9.75L11.375 14.625H6.5V24.375H11.375L16.25 29.25V9.75Z"
              stroke="#7750D3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24.375 14.625C25.4948 15.7448 26.125 17.2474 26.125 18.8125C26.125 20.3776 25.4948 21.8802 24.375 23"
              stroke="#7750D3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28.4375 10.5625C30.6797 12.8047 32 15.8984 32 19.5C32 23.1016 30.6797 26.1953 28.4375 28.4375"
              stroke="#7750D3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className={styles.answerButton}
          onClick={handleToggleMeaning}
          type="button"
        >
          <span className={styles.answerButtonText}>答え</span>
        </button>

        {showMeaning ? (
          <div className={styles.meaningText}>{word.meaning}</div>
        ) : (
          <div className={styles.wordText}>{word.word}</div>
        )}
      </div>
    </div>
  );
};
