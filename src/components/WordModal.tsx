"use client";
import styles from "./WordModal.module.scss";

import { addBox } from "@/lib/firestore";
import { motion } from "framer-motion";
import { Button } from "./elements/Button";
import { InputField } from "./elements/Input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signInValue } from "@/schemas/signIn";
import { useState } from "react";

export const WordModal = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signInValue>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit: SubmitHandler<signInValue> = async () => {
    try {
      addBox();
      setIsLoading(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: "70%" }}
      animate={{
        opacity: "100%",
        scale: "100%",
      }}
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
            url="https://api.iconify.design/line-md:email.svg?color=%23A4A5B5"
            placeholder="単語ボックスの名前を入れて！！"
            errors={errors.email?.message}
            {...register("email")}
          />
          <InputField
            placeholder="秘密のパスワードを入力してね！！"
            errors={errors.password?.message}
            {...register("password")}
            isPassword={true}
          />
        </div>

        <Button type="submit" isLoading={isLoading}>
          Sign In
        </Button>
      </div>
    </motion.form>
  );
};
