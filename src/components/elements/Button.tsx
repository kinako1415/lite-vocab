"ues client";
import { motion } from "framer-motion";
import styles from "./Button.module.scss";
import Image from "next/image";

export const Button = ({
  children,
  type,
  onClick,
  color,
  isLoading,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
  onClick?: () => void;
  color?: "gray" | "red";
  isLoading?: boolean;
}) => {
  return (
    <motion.button
      className={`${styles.button} ${color ? styles[color] : ""} ${
        isLoading && styles.loading
      }`}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      {isLoading ? (
        <Image
          alt="loading"
          src="https://api.iconify.design/line-md:loading-loop.svg?color=%23ffffff"
          width={28}
          height={28}
          priority
          className={styles.image}
        />
      ) : (
        children
      )}
    </motion.button>
  );
};
