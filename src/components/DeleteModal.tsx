"use client";
import styles from "./DeleteModal.module.scss";

import { motion } from "framer-motion";
import { Button } from "./elements/Button";
import { useState } from "react";
import { activeBoxesAtom } from "@/store/boxesAtom";
import { useAtomValue } from "jotai";
import { deleteBox } from "@/lib/firestore";

type DeleteModalType = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

export const DeleteModal: React.FC<DeleteModalType> = ({
  setIsOpen,
  isOpen,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const activeBoxes = useAtomValue(activeBoxesAtom);

  const handleBackgroundClick = () => {
    setIsOpen(false);
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      if (activeBoxes) await deleteBox(activeBoxes);
      setIsOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen ? (
        <div className={styles.container} onClick={handleBackgroundClick}>
          <motion.div
            initial={{ opacity: 0, scale: "70%" }}
            animate={{
              opacity: "100%",
              scale: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
            transition={{
              duration: 0.2,
              scale: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
              y: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
              filter: { duration: 0.3 },
            }}
          >
            <div className={styles.titleContainer}>
              <div>〇〇を消そうとしてます</div>
              <div>本当に消して大丈夫？</div>
            </div>
            <Button
              isLoading={isLoading}
              onClick={() => {
                handleDelete();
              }}
            >
              削除
            </Button>
          </motion.div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
