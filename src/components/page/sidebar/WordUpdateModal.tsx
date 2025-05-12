"use client";
import styles from "./WordUpdateModal.module.scss";

import { updateWord } from "@/lib/firestore";
import { motion } from "framer-motion";
import { Button } from "../../elements/Button";
import { InputField } from "../../elements/Input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wordSchemas } from "@/schemas/word";
import { WordsValue } from "@/types/word";
import { useEffect, useState } from "react";

type WordUpdateModalType = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  boxesId: string;
  wordId: string;
  initialWord: string;
  initialMeaning: string;
};

export const WordUpdateModal: React.FC<WordUpdateModalType> = ({
  setIsOpen,
  isOpen,
  boxesId,
  wordId,
  initialWord,
  initialMeaning,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<WordsValue>({
    resolver: zodResolver(wordSchemas),
  });

  useEffect(() => {
    if (isOpen) {
      setValue("word", initialWord);
      setValue("meaning", initialMeaning);
    }
  }, [isOpen, initialWord, initialMeaning, setValue]);

  const onSubmit: SubmitHandler<WordsValue> = async (form) => {
    try {
      setIsLoading(true);
      await updateWord(boxesId, wordId, form.word, form.meaning);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
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
              <div className={styles.title}>📝 単語の更新</div>
              <div className={styles.subTitle}>
                ✨ 単語と意味を更新しましょう！
              </div>
            </div>
            <div className={styles.mainContainer}>
              <div className={styles.inputContainer}>
                <InputField
                  placeholder="単語を入力してください"
                  errors={errors.word?.message}
                  {...register("word")}
                />
                <InputField
                  placeholder="意味を入力してください"
                  errors={errors.meaning?.message}
                  {...register("meaning")}
                />
              </div>

              <Button isLoading={isLoading}>更新する</Button>
            </div>
          </motion.form>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
