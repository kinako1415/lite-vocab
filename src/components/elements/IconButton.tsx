"ues client";
import { motion } from "framer-motion";
import styles from "./IconButton.module.scss";
import Image from "next/image";

export const IconButton = ({
  onClick,
  color,
  url,
}: {
  onClick?: () => void;
  color?: "gray" | "purple";
  url: string;
}) => {
  return (
    <motion.button
      className={`${styles.button} ${color ? styles[color] : ""}`}
      whileTap={{
        scale: 0.9,
        transition: { type: "spring", stiffness: 400, damping: 15 },
      }}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <Image
        alt={`${url}`}
        src={url}
        width={28}
        height={28}
        priority
        className={styles.image}
      />
    </motion.button>
  );
};
