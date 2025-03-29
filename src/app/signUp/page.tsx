"use client";
import styles from "./page.module.scss";
import { CreateUser } from "@/lib/auth";
import { useState } from "react";
import Button from "@/components/elements/Button";
import Input from "@/components/elements/Input";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  return (
    <div className={styles.container} onClick={(e) => e.stopPropagation()}>
      <motion.form
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: "100%", scale: "100%" }}
        onSubmit={(e) => {
          e.preventDefault();
          CreateUser({ email, password });
        }}
      >
        <div className={styles.titleContainer}>
          <div className={styles.title}>🤩 ユーザー登録をしよう！</div>
          <div className={styles.subTitle}>
            🚀 今すぐログインして、ワクワクする体験を始めよう！！
          </div>
        </div>
        <div className={styles.mainContainer}>
          <div className={styles.inputContainer}>
            <Input
              url="https://api.iconify.design/tabler:mail.svg?color=%23A4A5B5"
              placeholder="メールアドレスを入力！！"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <Input
              url="https://api.iconify.design/tabler:eye.svg?color=%23A4A5B5"
              placeholder="秘密のパスワードを入力してね！！"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              isPassword={true}
            />
            <Input
              url="https://api.iconify.design/tabler:eye.svg?color=%23A4A5B5"
              placeholder="秘密のパスワードをもう一度入力しよう！！"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              isPassword={true}
            />
          </div>

          <Button type="submit">Sign Up</Button>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerText}>OR</div>
            <div className={styles.dividerLine}></div>
          </div>

          <div className={styles.authContainer}>
            <Button type="submit" color="gray">
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
            もうアカウント登録してる？？ してるならここで
            <span
              className={styles.highlightText}
              onClick={() => {
                router.push("/signIn");
              }}
            >
              Sign In
            </span>
            !!
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default SignUp;
