"use client";
import styles from "./UrlImportModal.module.scss";
import { motion } from "framer-motion";
import { Button } from "../../elements/Button";
import { InputField } from "../../elements/Input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { extractWordsFromUrl } from "@/lib/gemini";
import { addWord } from "@/lib/firestore";
import { IconButton } from "@/components/elements/IconButton";

const urlImportSchema = z.object({
  url: z
    .string()
    .min(1, "URLを入力してください")
    .url("有効なURLを入力してください"),
});

type UrlImportValue = z.infer<typeof urlImportSchema>;

type UrlImportModalType = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  boxesId: string;
};

export const UrlImportModal: React.FC<UrlImportModalType> = ({
  setIsOpen,
  isOpen,
  boxesId,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [extractedWords, setExtractedWords] = useState<
    Array<{ word: string; meaning: string }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [editingWord, setEditingWord] = useState<{
    word: string;
    meaning: string;
  }>({
    word: "",
    meaning: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UrlImportValue>({
    resolver: zodResolver(urlImportSchema),
  });

  const onSubmit: SubmitHandler<UrlImportValue> = async (form) => {
    try {
      setIsExtracting(true);
      setError(undefined);
      const words = await extractWordsFromUrl(form.url);
      setExtractedWords(words);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error extracting words:", error);
      if (error instanceof Error) {
        if (error.message.includes("429") || error.message.includes("quota")) {
          setError(
            "APIの制限に達しました。しばらく待ってから再度お試しください。"
          );
        } else if (error.message.includes("API key")) {
          setError("APIキーの設定に問題があります。");
        } else {
          setError("単語の抽出中にエラーが発生しました。");
        }
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddWords = async () => {
    try {
      setIsLoading(true);
      for (const word of extractedWords) {
        await addWord(word.word, word.meaning, boxesId);
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding words:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundClick = () => {
    setIsOpen(false);
  };

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingWord((prev) => ({ ...prev, word: e.target.value }));
  };

  const handleMeaningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingWord((prev) => ({ ...prev, meaning: e.target.value }));
  };

  const handleSaveEdit = () => {
    const newWords = [...extractedWords];
    newWords[currentIndex] = { ...editingWord };
    setExtractedWords(newWords);
  };

  useEffect(() => {
    if (isOpen === false) {
      reset();
      setExtractedWords([]);
      setCurrentIndex(0);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (extractedWords.length > 0) {
      setEditingWord(extractedWords[currentIndex]);
    }
  }, [currentIndex, extractedWords]);

  return (
    <>
      {isOpen ? (
        <div className={styles.container} onClick={handleBackgroundClick}>
          <motion.form
            initial={{ opacity: 0, scale: "70%" }}
            animate={{
              opacity: "100%",
              scale: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              if (extractedWords.length > 0) {
                e.preventDefault();
                return;
              }
              handleSubmit(onSubmit)(e);
            }}
            transition={{
              duration: 0.2,
              scale: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
              y: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
              filter: { duration: 0.3 },
            }}
          >
            <div className={styles.titleContainer}>
              <div className={styles.title}>🌐 URLから単語を取得</div>
              <div className={styles.subTitle}>
                📚 ウェブサイトから単語を自動で抽出します
              </div>
            </div>
            <div className={styles.mainContainer}>
              {extractedWords.length === 0 ? (
                <div className={styles.inputContainer}>
                  <InputField
                    placeholder="URLを入力してください"
                    errors={errors.url?.message || error}
                    {...register("url")}
                  />
                  <Button
                    type="submit"
                    isLoading={isExtracting}
                    disabled={isExtracting}
                  >
                    単語を抽出
                  </Button>
                </div>
              ) : (
                <div className={styles.previewContainer}>
                  <div className={styles.navigationButtons}>
                    <IconButton
                      url="https://api.iconify.design/heroicons:chevron-left-16-solid.svg?color=%237750D3"
                      onClick={() => {
                        if (currentIndex > 0) {
                          handleSaveEdit();
                          setCurrentIndex((prev) => prev - 1);
                        }
                      }}
                      color={"gray"}
                    />
                    <div className={styles.previewTitle}>
                      読み取った単語！！ ({currentIndex + 1}/
                      {extractedWords.length})
                    </div>
                    <IconButton
                      url="https://api.iconify.design/heroicons:chevron-right-16-solid.svg?color=%237750D3"
                      onClick={() => {
                        if (currentIndex < extractedWords.length - 1) {
                          handleSaveEdit();
                          setCurrentIndex((prev) => prev + 1);
                        }
                      }}
                      color={"gray"}
                    />
                  </div>
                  <div className={styles.wordPreview}>
                    <InputField
                      value={editingWord.word}
                      onChange={handleWordChange}
                      placeholder="単語"
                    />
                    <InputField
                      value={editingWord.meaning}
                      onChange={handleMeaningChange}
                      placeholder="意味"
                    />
                  </div>
                  <div className={styles.actionButtons}>
                    <Button
                      type="button"
                      onClick={() => {
                        setExtractedWords([]);
                        setCurrentIndex(0);
                      }}
                      color="gray"
                    >
                      やり直す
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        handleSaveEdit();
                        handleAddWords();
                      }}
                      isLoading={isLoading}
                    >
                      単語を追加
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.form>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
