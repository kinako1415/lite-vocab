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
  disabled,
  variant,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
  onClick?: () => void;
  color?: "gray" | "red";
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "translate";
}) => {
  return (
    <motion.button
      className={`${styles.button} ${color ? styles[color] : ""} ${
        isLoading && styles.loading
      } ${disabled && styles.disabled} ${variant ? styles[variant] : ""}`}
      whileTap={{
        scale: disabled ? 1 : 0.9,
        transition: { type: "spring", stiffness: 400, damping: 15 },
      }}
      type={type}
      onClick={() => {
        if (onClick && !disabled) onClick();
      }}
      disabled={disabled}
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
