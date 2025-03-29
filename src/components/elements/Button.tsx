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
    <button
      className={`${styles.button} ${color ? styles[color] : ""}`}
      type={type}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      {children}
    </button>
  );
};

export default Button;
