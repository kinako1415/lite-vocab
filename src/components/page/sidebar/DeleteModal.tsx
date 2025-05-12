"use client";
import { motion } from "framer-motion";
import styles from "./DeleteModal.module.scss";
import { Button } from "@/components/elements/Button";

type DeleteModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onDelete: () => void;
  boxName: string;
};

export const DeleteModal = ({
  isOpen,
  setIsOpen,
  onDelete,
  boxName,
}: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.container} onClick={() => setIsOpen(false)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{
          duration: 0.2,
          scale: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
          y: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
          filter: { duration: 0.3 },
        }}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.messageContainer}>
          <div className={styles.message}>{boxName}を消そうとしてます</div>
          <div className={styles.message}>本当に消して大丈夫？</div>
        </div>
        <div className={styles.buttonContainer}>
          <Button onClick={() => setIsOpen(false)} color="gray">
            キャンセル
          </Button>
          <Button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            color="red"
          >
            削除する
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
