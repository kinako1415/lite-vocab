"ues client";
import { motion } from "framer-motion";
import styles from "./WordsCard.module.scss";

export const WordsCard = ({
  onClick,
  meaning,
  word,
}: {
  onClick?: () => void;
  meaning: string;
  word: string;
}) => {
  return (
    <motion.div
      className={styles.container}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <div className={styles.word}>{word}</div>
      <div className={styles.meaning}>{meaning}</div>
    </motion.div>
  );
};
