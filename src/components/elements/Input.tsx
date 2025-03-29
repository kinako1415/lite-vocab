import styles from "./Input.module.scss";
import Image from "next/image";

const StartButton = ({
  url,
  onChange,
  type,
}: {
  url: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
}) => {
  return (
    <div className={styles.inputContainer}>
      <input
        className={styles.input}
        type={type}
        onChange={(e) => {
          onChange(e);
        }}
      ></input>
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
