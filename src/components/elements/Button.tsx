"ues client";
import { motion } from "framer-motion";
import styles from "./Button.module.scss";
import Image from "next/image";
import { useState } from "react";

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={`${styles.button} ${color ? styles[color] : ""} ${
        isLoading && styles.loading
      } ${disabled && styles.disabled} ${variant ? styles[variant] : ""}`}
      whileTap={{
        scale: disabled ? 1 : 0.9,
        transition: { type: "spring", stiffness: 400, damping: 15 },
      }}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
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
      ) : variant === "translate" ? (
        <div className={styles.content}>
          <motion.div
            initial={{ rotate: 0, y: "3px" }}
            animate={{ rotate: isHovered ? 360 : 0, y: "3px" }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.5,
            }}
          >
            <Image
              alt="translate"
              src={`https://api.iconify.design/octicon:sparkles-fill-16.svg?color=${
                disabled ? "%23A4A5B5" : "%23ffffff"
              }`}
              width={24}
              height={24}
              priority
            />
          </motion.div>
          {children}
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};
