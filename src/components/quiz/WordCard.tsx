import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QuizWord, AnswerType } from "@/types/quiz";
import { IconButton } from "@/components/elements/IconButton";
import styles from "./WordCard.module.scss";

interface WordCardProps {
  word: QuizWord;
  onAnswer: (answerType: AnswerType) => void;
  onDragPreview?: (preview: {
    type: "know" | "unknown" | "vague" | null;
    show: boolean;
  }) => void;
  isExiting?: boolean;
  exitDirection?: AnswerType;
  isNextCard?: boolean; // 次のカードかどうかを示すフラグ
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  onAnswer,
  onDragPreview,
  isExiting = false,
  exitDirection,
  isNextCard = false,
}) => {
  const [showMeaning, setShowMeaning] = useState(false);

  const threshold = 100; // スワイプと判定する最小距離

  // 振動フィードバック
  const vibrate = (pattern: number | number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // 単語が変わったら答えの表示状態をリセット
  useEffect(() => {
    setShowMeaning(false);
  }, [word.id]);

  const handleToggleMeaning = () => {
    vibrate(25); // カードフリップ時の振動
    setShowMeaning(!showMeaning);
  }; 
  
  // ドラッグ中のプレビュー表示
  const updateDragPreview = (offset: { x: number; y: number }) => {
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);
    
    // プレビュー表示の閾値（実際のスワイプ判定より低く設定）
    const previewThreshold = 30; // より早くフィードバックを表示
    
    // カードの状態に関わらず、ドラッグ方向に応じたフィードバックを表示
    if (absX > previewThreshold && absX > absY) {
      // 横方向のドラッグ
      if (offset.x > 0) {
        onDragPreview?.({ type: "know", show: true });
      } else {
        onDragPreview?.({ type: "unknown", show: true });
      }
    } else if (absY > previewThreshold && absX < absY && offset.y > 0) {
      // 下方向のドラッグ
      onDragPreview?.({ type: "vague", show: true });
    } else {
      // 閾値以下の場合はプレビューを非表示
      onDragPreview?.({ type: null, show: false });
    }
  };

  // ドラッグ終了時にプレビューをクリア
  const clearDragPreview = () => {
    onDragPreview?.({ type: null, show: false });
  };
  
  // フリップ状態でもドラッグが可能かどうか
  // 常にドラッグ可能（フリップ状態でも操作できるように）
  const isDraggable = !isExiting && !isNextCard;

  const handleSpeakWord = () => {
    if ("speechSynthesis" in window) {
      vibrate(20); // 音声ボタン押下時の振動
      const utterance = new SpeechSynthesisUtterance(word.word);

      // 単語の言語を自動検出
      const detectedLanguage = detectLanguage(word.word);
      utterance.lang = detectedLanguage;

      // 言語に応じた音声設定の最適化
      const voiceSettings = getVoiceSettings(detectedLanguage);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      // 利用可能な音声の中から最適なものを選択
      const voices = speechSynthesis.getVoices();
      const preferredVoice = findBestVoice(voices, detectedLanguage);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
    }
  };

  // 言語に応じた音声設定を取得
  const getVoiceSettings = (language: string) => {
    const settings: {
      [key: string]: { rate: number; pitch: number; volume: number };
    } = {
      "ja-JP": { rate: 0.7, pitch: 1.1, volume: 0.9 }, // 日本語は少しゆっくり、高めの音程
      "en-US": { rate: 0.8, pitch: 1.0, volume: 0.8 }, // 英語は標準的
      "zh-CN": { rate: 0.7, pitch: 1.2, volume: 0.9 }, // 中国語は声調を考慮して高め
      "ko-KR": { rate: 0.7, pitch: 1.1, volume: 0.9 }, // 韓国語は少しゆっくり
      "fr-FR": { rate: 0.9, pitch: 0.9, volume: 0.8 }, // フランス語は流暢に
      "es-ES": { rate: 0.9, pitch: 1.0, volume: 0.8 }, // スペイン語は流暢に
      "de-DE": { rate: 0.8, pitch: 0.9, volume: 0.8 }, // ドイツ語は少し低めの音程
      "it-IT": { rate: 0.9, pitch: 1.1, volume: 0.8 }, // イタリア語は音楽的に
      "pt-PT": { rate: 0.8, pitch: 1.0, volume: 0.8 }, // ポルトガル語は標準的
      "ru-RU": { rate: 0.7, pitch: 0.9, volume: 0.9 }, // ロシア語は重厚に
      "ar-SA": { rate: 0.7, pitch: 1.0, volume: 0.9 }, // アラビア語はゆっくり
    };

    return settings[language] || { rate: 0.8, pitch: 1.0, volume: 0.8 };
  };

  // 最適な音声を選択
  const findBestVoice = (
    voices: SpeechSynthesisVoice[],
    targetLang: string
  ) => {
    // 完全一致する音声を検索
    let bestVoice = voices.find((voice) => voice.lang === targetLang);

    if (!bestVoice) {
      // 言語コードの前半部分で検索（例: en-US -> en）
      const langCode = targetLang.split("-")[0];
      bestVoice = voices.find((voice) => voice.lang.startsWith(langCode));
    }

    if (!bestVoice) {
      // 特定の言語で高品質な音声を優先選択
      const preferredVoices: { [key: string]: string[] } = {
        en: ["Google US English", "Microsoft Zira", "Alex", "Samantha"],
        ja: ["Google 日本語", "Microsoft Haruka", "Kyoko", "Otoya"],
        zh: ["Google 中文", "Microsoft Huihui", "Ting-Ting"],
        ko: ["Google 한국어", "Microsoft Heami", "Yuna"],
        fr: ["Google français", "Microsoft Hortense", "Amelie"],
        es: ["Google español", "Microsoft Helena", "Monica"],
        de: ["Google Deutsch", "Microsoft Hedda", "Anna"],
        it: ["Google italiano", "Microsoft Elsa", "Alice"],
        pt: ["Google português", "Microsoft Heloisa", "Joana"],
        ru: ["Google русский", "Microsoft Irina", "Milena"],
        ar: ["Google العربية", "Microsoft Naayf", "Maged"],
      };

      const langCode = targetLang.split("-")[0];
      const preferred = preferredVoices[langCode];

      if (preferred) {
        for (const voiceName of preferred) {
          const voice = voices.find((v) =>
            v.name.includes(voiceName.split(" ")[0])
          );
          if (voice) {
            bestVoice = voice;
            break;
          }
        }
      }
    }

    return bestVoice;
  };

  // 改良された言語検出関数
  const detectLanguage = (text: string): string => {
    const lowerText = text.toLowerCase().trim();

    // 日本語の文字（ひらがな、カタカナ、漢字）が含まれているかチェック
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
      return "ja-JP";
    }

    // 韓国語の文字（ハングル）が含まれているかチェック
    if (/[\uAC00-\uD7AF]/.test(text)) {
      return "ko-KR";
    }

    // 中国語の文字（簡体字、繁体字）をより精密にチェック
    if (
      /[\u4E00-\u9FFF]/.test(text) &&
      !/[\u3040-\u309F\u30A0-\u30FF]/.test(text)
    ) {
      // 簡体字特有の文字をチェック
      if (
        /[与样来这样时候过还很多就说不人会一在能好没有他我大了都]/.test(text)
      ) {
        return "zh-CN";
      }
      // 繁体字特有の文字をチェック
      if (
        /[與樣來這樣時候過還很多就說不人會一在能好沒有他我大了都]/.test(text)
      ) {
        return "zh-TW";
      }
      return "zh-CN"; // デフォルトは簡体字
    }

    // ロシア語の文字（キリル文字）が含まれているかチェック
    if (/[\u0400-\u04FF]/.test(text)) {
      return "ru-RU";
    }

    // アラビア語の文字が含まれているかチェック
    if (/[\u0600-\u06FF]/.test(text)) {
      return "ar-SA";
    }

    // ヒンディー語の文字（デーヴァナーガリー文字）が含まれているかチェック
    if (/[\u0900-\u097F]/.test(text)) {
      return "hi-IN";
    }

    // タイ語の文字が含まれているかチェック
    if (/[\u0E00-\u0E7F]/.test(text)) {
      return "th-TH";
    }

    // ヨーロッパ言語の特徴的な文字と一般的な単語で判定
    const languagePatterns = [
      {
        lang: "fr-FR",
        chars: /[àâäéèêëîïôùûüÿç]/i,
        words:
          /\b(le|la|les|un|une|des|du|de|et|est|dans|pour|avec|sur|mais|que|qui|cette|tout|bien|être|avoir)\b/,
      },
      {
        lang: "es-ES",
        chars: /[ñáéíóúü]/i,
        words:
          /\b(el|la|los|las|un|una|y|es|en|de|que|para|con|por|son|del|se|no|te|lo|le|da|su|por|más)\b/,
      },
      {
        lang: "de-DE",
        chars: /[äöüß]/i,
        words:
          /\b(der|die|das|und|ist|in|zu|den|von|mit|für|auf|ein|eine|sich|sie|nicht|werden|haben|ich|werden)\b/,
      },
      {
        lang: "it-IT",
        chars: /[àèéìíîòóù]/i,
        words:
          /\b(il|la|lo|gli|le|un|una|e|è|in|di|che|per|con|su|da|del|della|sono|hanno|questo|più)\b/,
      },
      {
        lang: "pt-PT",
        chars: /[ãâáàçéêíóôõú]/i,
        words:
          /\b(o|a|os|as|um|uma|e|é|em|de|que|para|com|por|do|da|dos|das|se|não|mais|muito|bem)\b/,
      },
      {
        lang: "nl-NL",
        chars: /[]/,
        words:
          /\b(de|het|een|en|is|in|van|te|dat|voor|met|op|aan|door|over|zijn|hebben|worden|kunnen|zullen)\b/,
      },
    ];

    // 各言語パターンをチェック
    for (const pattern of languagePatterns) {
      const hasChars = pattern.chars.test(text);

      // 特徴的な文字がある、または複数の特徴的な単語がある場合
      if (
        hasChars ||
        lowerText.split(" ").filter((word) => pattern.words.test(word))
          .length >= 2
      ) {
        return pattern.lang;
      }
    }

    // 英語の一般的な単語パターンをチェック
    const englishWords =
      /\b(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out|day|get|has|him|his|how|its|may|new|now|old|see|two|way|who|boy|did|does|each|from|have|here|into|like|look|make|many|over|such|take|than|them|very|were)\b/;
    const englishWordCount = lowerText
      .split(" ")
      .filter((word) => englishWords.test(word)).length;

    if (englishWordCount >= 2) {
      return "en-US";
    }

    // デフォルトは英語
    return "en-US";
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number } }
  ) => {
    const { offset } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    // ドラッグプレビューをクリア
    clearDragPreview();

    // スワイプ判定
    if (absX > threshold && absX > absY) {
      // 横方向のスワイプ
      if (offset.x > 0) {
        onAnswer("know");
        vibrate(50); // スワイプ右: 振動フィードバック
      } else {
        onAnswer("unknown");
        vibrate(50); // スワイプ左: 振動フィードバック
      }
    } else if (absY > threshold && absX < absY) {
      // 縦方向のスワイプ
      if (offset.y > 0) {
        // 下スワイプ: あいまい
        onAnswer("vague");
        vibrate(50); // スワイプ下: 振動フィードバック
      } else {
        // 上スワイプ: カードフリップ
        handleToggleMeaning();
      }
    }
  };

  // ドラッグ中の処理
  const handleDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number } }
  ) => {
    // 現在のカード状態に関わらず、ドラッグプレビューを更新
    updateDragPreview(info.offset);
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
          scale: 0.9,
          boxShadow: "0 30px 60px rgba(119, 80, 211, 0.2)",
          filter: "brightness(1.1)",
        };
      case "unknown":
        return {
          x: -window.innerWidth - 300,
          y: 0,
          rotate: -30,
          opacity: 0,
          scale: 0.9,
          boxShadow: "0 30px 60px rgba(119, 80, 211, 0.2)",
          filter: "brightness(0.95)",
        };
      case "vague":
        return {
          x: 0,
          y: window.innerHeight + 300,
          rotate: 15,
          opacity: 0,
          scale: 0.9,
          boxShadow: "0 30px 60px rgba(119, 80, 211, 0.2)",
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className={styles.wordCard}
      drag={isDraggable} // スワイプは常に有効に戻す
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 1.05,
        rotate: 5,
        zIndex: 10,
        boxShadow: "0 15px 40px rgba(119, 80, 211, 0.15)",
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
          ? { scale: 0.9, opacity: 1, y: 0, boxShadow: "0 5px 20px rgba(0,0,0,0.05)" } // 次のカードは不透明度100に
          : { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0, boxShadow: "0 10px 30px rgba(119, 80, 211, 0.1)" }
      }
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 1.2,
        duration: isNextCard ? 0.5 : 0.3,
        delay: isNextCard ? 0.1 : 0,
      }}
      key={word.id} // 重要: 単語が変わったら完全に新しいコンポーネントとして扱う
    >
      <div
        className={`${styles.cardContent} ${
          showMeaning ? styles.showingMeaning : ""
        }`}
      >
        {/* カードの表面（単語側） */}
        <div className={styles.cardFront}>
          <IconButton
            url="https://api.iconify.design/heroicons:speaker-wave-20-solid.svg?color=%237750d3"
            onClick={handleSpeakWord}
          />

          <button className={styles.answerButton} onClick={handleToggleMeaning}>
            答え
          </button>

          <div className={styles.wordText}>{word.word}</div>

          {/* フリップヒント */}
          {!isNextCard && (
            <div className={styles.flipHint}>↑ タップ・スワイプで答え</div>
          )}
        </div>

        {/* カードの裏面（意味側） */}
        <div className={styles.cardBack}>
          <IconButton
            url="https://api.iconify.design/heroicons:speaker-wave-20-solid.svg?color=%237750d3"
            onClick={handleSpeakWord}
          />

          <button className={styles.answerButton} onClick={handleToggleMeaning}>
            単語
          </button>

          <div className={styles.meaningText}>{word.meaning}</div>

          {/* フリップヒント */}
          {!isNextCard && (
            <div className={styles.flipHint}>↑ タップ・スワイプで戻る</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
