import React, { useState } from "react";
import { motion } from "framer-motion";
import { QuizWord, AnswerType } from "@/types/quiz";
import { IconButton } from "@/components/elements/IconButton";
import styles from "./WordCard.module.scss";

interface WordCardProps {
  word: QuizWord;
  onAnswer: (answerType: AnswerType) => void;
  isExiting?: boolean;
  exitDirection?: AnswerType;
  isNextCard?: boolean; // 次のカードかどうかを示すフラグ
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  onAnswer,
  isExiting = false,
  exitDirection,
  isNextCard = false,
}) => {
  const [showMeaning, setShowMeaning] = useState(false);

  const threshold = 100; // スワイプと判定する最小距離

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

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number } }
  ) => {
    const { offset } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    // スワイプ判定
    if (absX > threshold && absX > absY) {
      // 横方向のスワイプ
      if (offset.x > 0) {
        onAnswer("know");
      } else {
        onAnswer("unknown");
      }
    } else if (offset.y > threshold && absY > absX) {
      onAnswer("vague");
    }
  };

  // exitDirectionに基づく退場アニメーション
  const getExitAnimation = () => {
    if (!exitDirection) return {};

    switch (exitDirection) {
      case "know":
        return {
          x: window.innerWidth + 300,
          y: 0,
          rotate: 30,
          opacity: 0,
          scale: 0.8,
        };
      case "unknown":
        return {
          x: -window.innerWidth - 300,
          y: 0,
          rotate: -30,
          opacity: 0,
          scale: 0.8,
        };
      case "vague":
        return {
          x: 0,
          y: window.innerHeight + 300,
          rotate: 15,
          opacity: 0,
          scale: 0.8,
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className={styles.wordCard}
      drag={!isExiting && !isNextCard}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 1.05,
        rotate: 5,
        zIndex: 10,
      }}
      initial={
        isNextCard
          ? { scale: 0.9, opacity: 0, y: 20 } // 次のカードは初期状態で不透明度0
          : { scale: 0.8, opacity: 0 }
      }
      animate={
        isExiting
          ? getExitAnimation()
          : isNextCard
          ? { scale: 0.9, opacity: 1, y: 0 } // 次のカードは不透明度100に
          : { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: isNextCard ? 0.4 : 0.2, // 全体的に速く
        delay: isNextCard ? 0.1 : 0, // 遅延も短く
      }}
      key={word.id} // 重要: 単語が変わったら完全に新しいコンポーネントとして扱う
    >
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
    </motion.div>
  );
};
