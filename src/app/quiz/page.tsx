"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuizWord } from "@/types/quiz";
import { QuizInterface } from "@/components/quiz/QuizInterface";
import { getWord } from "@/lib/firestore";
import { Words } from "@/types/word";
import styles from "./page.module.scss";

function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [words, setWords] = useState<QuizWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URLパラメータからboxIdを取得
    const boxId = searchParams.get("boxId");

    // FirestoreのWordsデータをQuizWordに変換する関数
    const convertWordsToQuizWords = (words: Words[]): QuizWord[] => {
      return words.map((word) => ({
        id: word.id,
        word: word.word,
        meaning: word.meaning,
        partOfSpeech: "", // WordsにはpartOfSpeechが含まれていないため空文字
      }));
    };

    // 単語データを読み込む関数
    const loadWords = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (boxId) {
          // 指定されたboxIdの単語を取得
          const wordsData = await getWord(boxId);

          if (wordsData.length === 0) {
            setError("この単語帳には単語が登録されていません。");
            return;
          }

          const quizWords = convertWordsToQuizWords(wordsData);
          setWords(quizWords);
        }
      } catch (err) {
        console.error("Failed to load words:", err);
        setError("単語の読み込みに失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    loadWords();
  }, [searchParams]);

  const handleExit = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className={styles.quizPageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>単語を読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.quizPageContainer}>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>エラー</h1>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.errorButton} onClick={handleExit}>
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className={styles.quizPageContainer}>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>単語がありません</h1>
          <p className={styles.errorMessage}>
            この単語帳には学習できる単語がありません。
          </p>
          <button className={styles.errorButton} onClick={handleExit}>
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.quizPageContainer}>
      <QuizInterface words={words} onExit={handleExit} />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.quizPageContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <div className={styles.loadingText}>読み込み中...</div>
          </div>
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}
