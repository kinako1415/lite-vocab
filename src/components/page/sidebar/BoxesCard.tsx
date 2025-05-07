"use client";
import { motion } from "framer-motion";
import styles from "./BoxesCard.module.scss";

type BoxesCardProps = {
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
};

export const BoxesCard = ({ children, isActive, onClick }: BoxesCardProps) => {
  return (
    <motion.button
      className={`${styles.button} ${isActive && styles.active}`}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      {children}
    </motion.button>
  );
};
