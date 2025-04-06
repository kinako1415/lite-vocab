"use client";
import styles from "./page.module.scss";
import { CreateUser, SignInWithGoogle } from "@/lib/auth";
import Button from "@/components/elements/Button";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { InputField } from "@/components/elements/Input";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, signUpValue } from "@/schemas/signUp";

const SignUp = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signUpValue>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<signUpValue> = (form) => {
    CreateUser({ email: form.email, password: form.passwordConfirm });
  };

  return (
    <div className={styles.container} onClick={(e) => e.stopPropagation()}>
      <motion.form
        initial={{ opacity: 0, scale: "70%", filter: "blur(10px)" }}
        animate={{
          opacity: "100%",
          scale: "100%",
          filter: "blur(0px)",
        }}
        transition={{
          duration: 0.2,
          scale: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
          filter: { duration: 0.3 },
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={styles.titleContainer}>
          <div className={styles.title}>🤩 ユーザー登録をしよう！</div>
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
              isPassword={true}
              {...register("password")}
            />
            <InputField
              placeholder="秘密のパスワードをもう一度入力しよう！！"
              errors={errors.passwordConfirm?.message}
              isPassword={true}
              {...register("passwordConfirm")}
            />
          </div>

          <Button type="submit">Sign Up</Button>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerText}>OR</div>
            <div className={styles.dividerLine}></div>
          </div>

          <div className={styles.authContainer}>
            <Button type="submit" color="gray" onClick={SignInWithGoogle}>
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
            <motion.span
              className={styles.highlightText}
              onClick={() => {
                router.push("/signin");
              }}
              initial={{
                opacity: "100%",
              }}
              whileHover={{
                opacity: "60%",
              }}
              transition={{ duration: 0.1 }}
            >
              Sign In
            </motion.span>
            !!
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default SignUp;
