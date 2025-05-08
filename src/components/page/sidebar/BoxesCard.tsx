"use client";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./BoxesCard.module.scss";
import { IconButton } from "@/components/elements/IconButton";
import { deleteBox } from "@/lib/firestore";
import { useState } from "react";
import { DeleteModal } from "./DeleteModal";

type BoxesCardProps = {
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
  activeBoxId: string;
  boxName: string;
};

export const BoxesCard = ({
  children,
  isActive,
  onClick,
  activeBoxId,
  boxName,
}: BoxesCardProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteBox(activeBoxId);
    } catch (error) {
      console.error("Error deleting box:", error);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <motion.button
        key={`button-${isActive}`}
        className={`${styles.button} ${isActive && styles.active}`}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (onClick) onClick();
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {children}

        <AnimatePresence initial={false}>
          <motion.div
            className={styles.highlightBar}
            initial={{ scale: 0 }}
            animate={{ scale: isHovered ? 1 : 0 }}
            whileHover={{ scale: 1 }}
            transition={{ duration: 0.01 }}
          />
        </AnimatePresence>
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
              onClick={() => setIsDeleteModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        onDelete={handleDelete}
        boxName={boxName}
      />
    </div>
  );
};
