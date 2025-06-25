import { useState, useCallback } from "react";
import {
  QuizWord,
  QuizAnswer,
  AnswerType,
  QuizProgress,
  QuizResult,
} from "@/types/quiz";

export const useQuizManager = (words: QuizWord[]) => {
  const [progress, setProgress] = useState<QuizProgress>({
    currentIndex: 0,
    totalWords: words.length,
    answers: [],
  });

  const [isCompleted, setIsCompleted] = useState(false);

  const currentWord = words[progress.currentIndex];
  const remainingWords = progress.totalWords - progress.currentIndex;

  const answerWord = useCallback(
    (answerType: AnswerType) => {
      if (!currentWord || isCompleted) return;

      const newAnswer: QuizAnswer = {
        wordId: currentWord.id,
        answerType,
        timestamp: Date.now(),
      };

      setProgress((prev) => {
        const newAnswers = [...prev.answers, newAnswer];
        const newIndex = prev.currentIndex + 1;

        if (newIndex >= prev.totalWords) {
          setIsCompleted(true);
        }

        return {
          ...prev,
          currentIndex: newIndex,
          answers: newAnswers,
        };
      });
    },
    [currentWord, isCompleted]
  );

  const getResults = useCallback((): QuizResult => {
    const knowCount = progress.answers.filter(
      (a) => a.answerType === "know"
    ).length;
    const unknownCount = progress.answers.filter(
      (a) => a.answerType === "unknown"
    ).length;
    const vagueCount = progress.answers.filter(
      (a) => a.answerType === "vague"
    ).length;

    return {
      totalWords: progress.totalWords,
      knowCount,
      unknownCount,
      vagueCount,
      answers: progress.answers,
      completedAt: Date.now(),
    };
  }, [progress]);

  const restart = useCallback(() => {
    setProgress({
      currentIndex: 0,
      totalWords: words.length,
      answers: [],
    });
    setIsCompleted(false);
  }, [words.length]);

  return {
    currentWord,
    progress,
    remainingWords,
    isCompleted,
    answerWord,
    getResults,
    restart,
  };
};
