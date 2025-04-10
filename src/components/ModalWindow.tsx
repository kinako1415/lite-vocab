import { motion } from "framer-motion";
import styles from "./ModalWindow.module.scss";
import { ReactNode } from "react";

type ModalWindowType = {
  children: ReactNode;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

export const ModalWindow: React.FC<ModalWindowType> = ({
  children,
  setIsOpen,
  isOpen,
}) => {
  const handleBackgroundClick = () => {
    // 背景がクリックされたときにモーダルを閉じる
    setIsOpen(false);
  };
  return (
    <>
      {isOpen ? (
        <div className={styles.container} onClick={handleBackgroundClick}>
          <motion.div
            className={styles.mainContainer}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: "100%", scale: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: "100%", scale: "100%" }}
          ></motion.div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
