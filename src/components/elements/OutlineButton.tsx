"ues client";
import { motion } from "framer-motion";
import styles from "./OutlineButton.module.scss";
import Image from "next/image";

export const OutlineButton = ({
  children,
  type,
  onClick,
  isLoading,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
  onClick?: () => void;
  isLoading?: boolean;
}) => {
  return (
    <motion.button
      className={`${styles.button} ${isLoading && styles.loading}`}
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
        />
      ) : (
        children
      )}
    </motion.button>
  );
};
