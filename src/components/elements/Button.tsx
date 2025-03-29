import styles from "./Button.module.scss";

const StartButton = ({ children }: { children: React.ReactNode }) => {
  return <button className={styles.button}>{children}</button>;
};

export default StartButton;
