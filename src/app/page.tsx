"use client";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { deleteSessionCookie } from "./actions/deleteSessionCookie";
import styles from "./page.module.scss";
import Image from "next/image";
import { addBox } from "@/lib/firestore";
import { OutlineButton } from "@/components/elements/OutlineButton";
import { ModalWindow } from "@/components/ModalWindow";
import { motion } from "framer-motion";
import { InputField } from "@/components/elements/Input";
import { Button } from "@/components/elements/Button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signInValue } from "@/schemas/signIn";
import { FirebaseError } from "firebase/app";
import { actionsCreateSessionCookie } from "./actions/createSessionCookie";
import { SignInWithGoogle } from "@/lib/auth";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const router = useRouter();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await deleteSessionCookie();
      router.push("/");
      return { success: true };
    } catch (error) {
      console.log("Sign out error:", error);
      return { success: false, error: "サインアウトに失敗しました" };
    }
  };

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
    <div>
      <ModalWindow
        isOpen={isOpen}
        setIsOpen={() => {
          setIsOpen(!isOpen);
        }}
      >
        <motion.form
          initial={{ opacity: 0, scale: "70%", filter: "blur(10px)" }}
          animate={{
            opacity: "100%",
            scale: "100%",
            filter: isSuccess ? "blur(1px)" : "blur(0px)",
            y: isSuccess ? "340px" : "0",
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
        <button
          onClick={() => {
            addBox();
          }}
        >
          あいうえおかきくけこ
        </button>
      </ModalWindow>
      <div>
        <button
          onClick={() => {
            handleSignOut();
          }}
        >
          サインアウトかも
        </button>
        <div
          className={`${styles.boxContainer} ${isActive && styles.active}`}
          onClick={() => {
            setIsActive(!isActive);
          }}
        >
          ☺️形容詞まとめ
        </div>
        <OutlineButton
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          単語まとめの作成
        </OutlineButton>
      </div>
      <div>{user ? user.email : ""}</div>
    </div>
  );
}
