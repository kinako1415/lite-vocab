import styles from "./Button.module.scss";

const Button = ({
  children,
  type,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
  onClick?: () => void;
}) => {
  return (
    <button
      className={styles.button}
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
