"use client";
import styles from "./WordsModal.module.scss";

import { addWord } from "@/lib/firestore";
import { motion } from "framer-motion";
import { Button } from "../elements/Button";
import { InputField } from "../elements/Input";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { wordSchemas } from "@/schemas/word";
import { WordsValue } from "@/types/word";
import { activeBoxesAtom } from "@/store/boxesAtom";
import { useAtomValue } from "jotai";
import { translateWord } from "@/lib/gemini";

type WordsModalType = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

export const WordsModal: React.FC<WordsModalType> = ({ setIsOpen, isOpen }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const activeBoxes = useAtomValue(activeBoxesAtom);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<WordsValue>({
    resolver: zodResolver(wordSchemas),
  });

  const word = useWatch({ control, name: "word" });

  const handleTranslate = async () => {
    if (!word) return;

    try {
      setIsTranslating(true);
      const translatedText = await translateWord(word);
      setValue("meaning", translatedText);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const onSubmit: SubmitHandler<WordsValue> = async (form) => {
    try {
      setIsLoading(true);
      if (activeBoxes) await addWord(form.word, form.meaning, activeBoxes);
      reset();
    } catch (error) {
      console.log(error);
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
              <div className={styles.title}>😎 単語の追加！</div>
              <div className={styles.subTitle}>
                🚀 追加したらたくさんの管理できるかも！！！
              </div>
            </div>
            <div className={styles.mainContainer}>
              <div className={styles.inputContainer}>
                <InputField
                  placeholder="覚えたい単語を入力！！"
                  errors={errors.word?.message}
                  {...register("word")}
                />
                <InputField
                  placeholder="単語の意味を入力！！"
                  errors={errors.meaning?.message}
                  {...register("meaning")}
                />
              </div>
              <div className={styles.buttonContainer}>
                <div className={styles.translateButton}>
                  <Button
                    type="button"
                    onClick={handleTranslate}
                    isLoading={isTranslating}
                    disabled={!word}
                    variant="translate"
                  >
                    翻訳
                  </Button>
                </div>
                <div className={styles.actionButtons}>
                  <Button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    color="gray"
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" isLoading={isLoading}>
                    単語を追加
                  </Button>
                </div>
              </div>
            </div>
          </motion.form>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
