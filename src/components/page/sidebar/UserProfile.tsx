"use client";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import styles from "./UserProfile.module.scss";
import { deleteSessionCookie } from "@/app/actions/deleteSessionCookie";
import { useRouter } from "next/navigation";

export const UserProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Image
            src="https://api.iconify.design/line-md:loading-loop.svg?color=%23ffffff"
            alt="loading"
            width={24}
            height={24}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.displayName || "ユーザー";
  const email = user.email || "";
  const photoURL = user.photoURL;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await deleteSessionCookie();
      router.push("/");
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: "サインアウトに失敗しました" };
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={styles.profileButton}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={styles.avatar}>
          {photoURL ? (
            <Image
              src={photoURL}
              alt="プロフィール画像"
              width={28}
              height={28}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarFallback}>
              <Image
                src="https://api.iconify.design/heroicons:user-solid.svg?color=%23ffffff"
                alt="ユーザー"
                width={14}
                height={14}
              />
            </div>
          )}
        </div>

        <div className={styles.userInfo}>
          <div className={styles.name}>{displayName}</div>
          <div className={styles.email}>{email}</div>
        </div>

        <motion.div
          className={styles.expandIcon}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src="https://api.iconify.design/heroicons:chevron-up-16-solid.svg?color=%23ffffff"
            alt="展開"
            width={12}
            height={12}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.expandedMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={styles.menuItem}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src="https://api.iconify.design/heroicons:cog-6-tooth-solid.svg?color=%23ffffff"
                alt="設定"
                width={14}
                height={14}
              />
              <span>設定</span>
            </motion.div>

            <motion.div
              className={styles.menuItem}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src="https://api.iconify.design/heroicons:question-mark-circle-solid.svg?color=%23ffffff"
                alt="ヘルプ"
                width={14}
                height={14}
              />
              <span>ヘルプ</span>
            </motion.div>

            <div className={styles.divider} />

            <motion.div
              className={styles.menuItem}
              onClick={handleSignOut}
              whileHover={{ backgroundColor: "rgba(220, 38, 38, 0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src="https://api.iconify.design/heroicons:arrow-right-start-on-rectangle-solid.svg?color=%23ff4444"
                alt="サインアウト"
                width={14}
                height={14}
              />
              <span style={{ color: "#ff4444" }}>サインアウト</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
