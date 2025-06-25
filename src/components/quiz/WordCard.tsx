import React, { useState } from "react";
import { QuizWord, AnswerType } from "@/types/quiz";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { IconButton } from "@/components/elements/IconButton";
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
        <IconButton
          url="https://api.iconify.design/heroicons:speaker-wave-20-solid.svg?color=%237750d3"
          onClick={handleSpeakWord}
        />

        <button className={styles.answerButton} onClick={handleToggleMeaning}>
          答え
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
