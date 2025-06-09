"use client";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import styles from "./UserProfile.module.scss";

interface UserProfileProps {
  onSignOut?: () => void;
}

export const UserProfile = ({ onSignOut }: UserProfileProps) => {
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
            src="https://api.iconify.design/line-md:loading-loop.svg?color=%23A4A5B5"
            alt="loading"
            width={32}
            height={32}
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

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
    setIsExpanded(false);
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
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
              width={40}
              height={40}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarFallback}>
              <Image
                src="https://api.iconify.design/heroicons:user-solid.svg?color=%23ffffff"
                alt="ユーザー"
                width={20}
                height={20}
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
            src="https://api.iconify.design/heroicons:chevron-up-16-solid.svg?color=%237750D3"
            alt="展開"
            width={16}
            height={16}
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
                width={16}
                height={16}
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
                width={16}
                height={16}
              />
              <span>ヘルプ</span>
            </motion.div>

            <div className={styles.divider} />
            
            <motion.div 
              className={styles.menuItem}
              onClick={handleSignOut}
              whileHover={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src="https://api.iconify.design/heroicons:arrow-right-start-on-rectangle-solid.svg?color=%23dc2626"
                alt="サインアウト"
                width={16}
                height={16}
              />
              <span style={{ color: "#dc2626" }}>サインアウト</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
