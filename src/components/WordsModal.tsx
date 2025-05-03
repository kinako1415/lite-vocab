"use client";
import styles from "./WordsModal.module.scss";

import { addWord } from "@/lib/firestore";
import { motion } from "framer-motion";
import { Button } from "./elements/Button";
import { InputField } from "./elements/Input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { wordSchemas } from "@/schemas/word";
import { WordsValue } from "@/types/word";
import { activeBoxesAtom } from "@/store/boxesAtom";
import { useAtomValue } from "jotai";

type WordsModalType = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

export const WordsModal: React.FC<WordsModalType> = ({ setIsOpen, isOpen }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const activeBoxes = useAtomValue(activeBoxesAtom);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WordsValue>({
    resolver: zodResolver(wordSchemas),
  });

  const onSubmit: SubmitHandler<WordsValue> = async (form) => {
    try {
      setIsLoading(true);
      reset();
      await addWord(form.word, form.meaning, activeBoxes);
      setIsOpen(false);
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
              <div className={styles.title}>😎 単語ボックスの追加！</div>
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

              <Button isLoading={isLoading}>単語ボックスを追加</Button>
            </div>
          </motion.form>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
