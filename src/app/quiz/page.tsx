"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuizWord } from "@/types/quiz";
import { QuizInterface } from "@/components/quiz/QuizInterface";
import styles from "./page.module.scss";

// サンプルデータ（実際の実装では、APIやFirestoreから取得）
const sampleWords: QuizWord[] = [
  {
    id: "1",
    word: "friend",
    meaning: "友達",
    partOfSpeech: "名詞",
  },
  {
    id: "2",
    word: "beautiful",
    meaning: "美しい",
    partOfSpeech: "形容詞",
  },
  {
    id: "3",
    word: "study",
    meaning: "勉強する",
    partOfSpeech: "動詞",
  },
  {
    id: "4",
    word: "important",
    meaning: "重要な",
    partOfSpeech: "形容詞",
  },
  {
    id: "5",
    word: "computer",
    meaning: "コンピューター",
    partOfSpeech: "名詞",
  },
  {
    id: "6",
    word: "understand",
    meaning: "理解する",
    partOfSpeech: "動詞",
  },
  {
    id: "7",
    word: "interesting",
    meaning: "興味深い",
    partOfSpeech: "形容詞",
  },
  {
    id: "8",
    word: "family",
    meaning: "家族",
    partOfSpeech: "名詞",
  },
  {
    id: "9",
    word: "travel",
    meaning: "旅行する",
    partOfSpeech: "動詞",
  },
  {
    id: "10",
    word: "knowledge",
    meaning: "知識",
    partOfSpeech: "名詞",
  },
];

function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [words, setWords] = useState<QuizWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URLパラメータからboxIdを取得
    const boxId = searchParams.get("boxId");

    if (!boxId) {
      // boxIdが指定されていない場合は、サンプルデータを使用
      setWords(sampleWords);
      setIsLoading(false);
      return;
    }

    // TODO: 実際の実装では、ここでFirestoreからboxIdに対応する単語データを取得
    // 現在はサンプルデータを使用
    const loadWords = async () => {
      try {
        // シミュレートされた非同期処理
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // TODO: 実際のFirestore取得処理
        // const wordsData = await getWordsFromBox(boxId);
        const wordsData = sampleWords;

        if (wordsData.length === 0) {
          setError("この単語帳には単語が登録されていません。");
          return;
        }

        setWords(wordsData);
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
