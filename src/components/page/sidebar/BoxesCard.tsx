"use client";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./BoxesCard.module.scss";
import { IconButton } from "@/components/elements/IconButton";
import { deleteBox } from "@/lib/firestore";

type BoxesCardProps = {
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
  activeBoxId: string;
};

export const BoxesCard = ({
  children,
  isActive,
  onClick,
  activeBoxId,
}: BoxesCardProps) => {
  return (
    <div className={styles.mainContainer}>
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
            initial={{ height: 0, opacity: 1, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 8 }}
            exit={{ height: 0, opacity: 1, marginTop: 0 }}
            transition={{ duration: 0.1 }}
          >
            <IconButton
              url="https://api.iconify.design/heroicons:play-solid.svg?color=%23ffffff"
              color="purple"
            />
            <IconButton
              url="https://api.iconify.design/material-symbols:delete-outline.svg?color=%23ffffff"
              color="purple"
              onClick={async () => {
                await deleteBox(activeBoxId);
                console.log("deleted");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
