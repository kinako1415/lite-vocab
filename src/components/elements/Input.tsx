import styles from "./Input.module.scss";
import Image from "next/image";

const StartButton = ({ url }: { url: string }) => {
  return (
    <div className={styles.inputContainer}>
      <input className={styles.input} />
      <Image
        src={url}
        alt="book"
        width={24}
        height={24}
        className={styles.image}
      />
    </div>
  );
};

export default StartButton;
