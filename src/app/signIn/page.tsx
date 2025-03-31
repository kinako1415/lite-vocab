"use client";
import styles from "./page.module.scss";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { actionsCreateSessionCookie } from "../actions/createSessionCookie";
// import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import Button from "@/components/elements/Button";
import Image from "next/image";
import { InputField } from "@/components/elements/Input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signInValue } from "@/schemas/signIn";
import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { SignInWithGoogle } from "@/lib/auth";

const SignIn = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signInValue>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit: SubmitHandler<signInValue> = async (form) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const idToken = await userCredential.user.getIdToken();
      // const decodedToken = jwtDecode(idToken);
      const response = await actionsCreateSessionCookie(idToken);
      if (!response.success) {
        return { success: false, error: response.error };
      }
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error(error.code);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container} onClick={(e) => e.stopPropagation()}>
      <motion.form
        initial={{ opacity: 0, scale: "70%", filter: "blur(10px)" }}
        animate={{
          opacity: "100%",
          scale: "100%",
          filter: "blur(0px)",
          y: isSuccess ? "500px" : "0",
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
          <div className={styles.title}>😎 サインインをしよう！！</div>
          <div className={styles.subTitle}>
            🚀 今すぐログインして、ワクワクする体験を始めよう！！
          </div>
        </div>
        <div className={styles.mainContainer}>
          <div className={styles.inputContainer}>
            <InputField
              url="https://api.iconify.design/line-md:email.svg?color=%23A4A5B5"
              placeholder="メールアドレスを入力！！"
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

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerText}>OR</div>
            <div className={styles.dividerLine}></div>
          </div>

          <div className={styles.authContainer}>
            <Button
              type="submit"
              color="gray"
              onClick={
                SignInWithGoogle
                // router.push("/signUp");
              }
            >
              <Image
                src="https://api.iconify.design/devicon:google.svg?color=%23293641"
                alt="google"
                width={28}
                height={28}
              />
            </Button>
            <Button type="submit" color="gray">
              <Image
                src="https://api.iconify.design/akar-icons:github-fill.svg?color=%23293641"
                alt="google"
                width={30}
                height={30}
              />
            </Button>
          </div>
          <div className={styles.registerMessage}>
            まだアカウント登録してない？ ここで
            <motion.span
              className={styles.highlightText}
              onClick={() => {
                router.push("/signUp");
              }}
              initial={{
                opacity: "100%",
              }}
              whileHover={{
                opacity: "60%",
              }}
            >
              Sign up
            </motion.span>
            !!
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default SignIn;
