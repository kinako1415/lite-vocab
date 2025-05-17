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
  const [extractedWords, setExtractedWords] = useState<
    Array<{ word: string; meaning: string }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

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
      const words = await extractWordsFromUrl(form.url);
      setExtractedWords(words);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error extracting words:", error);
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

  useEffect(() => {
    if (isOpen === false) {
      reset();
      setExtractedWords([]);
      setCurrentIndex(0);
    }
  }, [isOpen, reset]);

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
            onSubmit={handleSubmit(onSubmit)}
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
                    errors={errors.url?.message}
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
                  <div className={styles.previewTitle}>
                    抽出された単語 ({currentIndex + 1}/{extractedWords.length})
                  </div>
                  <div className={styles.wordPreview}>
                    <div className={styles.word}>
                      {extractedWords[currentIndex].word}
                    </div>
                    <div className={styles.meaning}>
                      {extractedWords[currentIndex].meaning}
                    </div>
                  </div>
                  <div className={styles.navigationButtons}>
                    <Button
                      type="button"
                      onClick={() =>
                        setCurrentIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentIndex === 0}
                      color="gray"
                    >
                      前へ
                    </Button>
                    <Button
                      type="button"
                      onClick={() =>
                        setCurrentIndex((prev) =>
                          Math.min(extractedWords.length - 1, prev + 1)
                        )
                      }
                      disabled={currentIndex === extractedWords.length - 1}
                      color="gray"
                    >
                      次へ
                    </Button>
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
                      onClick={handleAddWords}
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
