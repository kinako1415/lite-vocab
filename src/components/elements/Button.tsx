"ues client";
import { motion } from "framer-motion";
import styles from "./Button.module.scss";

const Button = ({
  children,
  type,
  onClick,
  color,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
  onClick?: () => void;
  color?: "gray";
}) => {
  return (
    <motion.button
      className={`${styles.button} ${color ? styles[color] : ""}`}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      {children}
    </motion.button>
  );
};

export default Button;
