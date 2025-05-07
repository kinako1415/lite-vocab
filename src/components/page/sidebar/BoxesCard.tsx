"use client";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./BoxesCard.module.scss";
import { IconButton } from "@/components/elements/IconButton";

type BoxesCardProps = {
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
};

export const BoxesCard = ({ children, isActive, onClick }: BoxesCardProps) => {
  return (
    <>
      <motion.button
        key={`button-${isActive}`}
        className={`${styles.button} ${isActive && styles.active}`}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (onClick) onClick();
        }}
      >
        {children}
      </motion.button>
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="button-container"
            className={styles.buttonContainer}
            initial={{ height: 0, opacity: 1 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            <IconButton
              url="https://api.iconify.design/heroicons:play-solid.svg?color=%23ffffff"
              color="purple"
            />
            <IconButton
              url="https://api.iconify.design/material-symbols:delete-outline.svg?color=%23ffffff"
              color="purple"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
