"use client";
import styles from "./page.module.scss";
import { CreateUser } from "@/lib/auth";
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
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: "100%", scale: "100%" }}
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
              url="https://api.iconify.design/tabler:mail.svg?color=%23A4A5B5"
              placeholder="メールアドレスを入力！！"
              errors={errors.email?.message}
              {...register("email")}
            />
            <InputField
              url="https://api.iconify.design/tabler:eye.svg?color=%23A4A5B5"
              placeholder="秘密のパスワードを入力してね！！"
              errors={errors.password?.message}
              isPassword={true}
              {...register("password")}
            />
            <InputField
              url="https://api.iconify.design/tabler:eye.svg?color=%23A4A5B5"
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
