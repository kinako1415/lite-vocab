"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuizWord } from "@/types/quiz";
import { QuizInterface } from "@/components/quiz/QuizInterface";
import { getWord } from "@/lib/firestore";
import { Words } from "@/types/word";
import { useAtom } from "jotai";
import { wordsCacheAtom } from "@/store/wordsAtom";
import styles from "./page.module.scss";

// サンプルデータ（boxIdが指定されていない場合に使用）
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
];

function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [words, setWords] = useState<QuizWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wordsCache, setWordsCache] = useAtom(wordsCacheAtom);

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
          // まずキャッシュから取得を試みる
          if (wordsCache[boxId]) {
            console.log(`Using cached data for box: ${boxId}`);
            const quizWords = convertWordsToQuizWords(wordsCache[boxId]);
            
            if (quizWords.length === 0) {
              setError("この単語帳には単語が登録されていません。");
              return;
            }
            
            setWords(quizWords);
          } else {
            // キャッシュにない場合はFirebaseから取得
            console.log(`Fetching data from Firebase for box: ${boxId}`);
            const wordsData = await getWord(boxId);

            if (wordsData.length === 0) {
              setError("この単語帳には単語が登録されていません。");
              return;
            }

            // キャッシュに保存
            setWordsCache((prev) => ({
              ...prev,
              [boxId]: wordsData,
            }));

            const quizWords = convertWordsToQuizWords(wordsData);
            setWords(quizWords);
          }
        } else {
          // boxIdが指定されていない場合はサンプルデータを使用
          setWords(sampleWords);
        }
      } catch (err) {
        console.error("Failed to load words:", err);
        setError("単語の読み込みに失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    loadWords();
  }, [searchParams, wordsCache, setWordsCache]);

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
