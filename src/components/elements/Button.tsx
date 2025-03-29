import styles from "./Button.module.scss";

const Button = ({
  children,
  type,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
}) => {
  return (
    <button className={styles.button} type={type}>
      {children}
    </button>
  );
};

export default Button;
