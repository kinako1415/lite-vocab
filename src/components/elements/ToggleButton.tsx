"use client";
import { motion } from "framer-motion";
import styles from "./ToggleButton.module.scss";

type ToggleButtonProps = {
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
};

export const ToggleButton = ({
  children,
  isActive,
  onClick,
}: ToggleButtonProps) => {
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
