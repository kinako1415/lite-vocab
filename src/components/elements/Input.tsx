import { useState } from "react";
import styles from "./Input.module.scss";
import Image from "next/image";

const StartButton = ({
  url,
  onChange,
  type = "text",
  placeholder,
  isPassword = false,
}: {
  url?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder: string;
  isPassword?: boolean;
}) => {
  const [isHidden, setIsHidden] = useState<boolean>(true);

  return (
    <div className={styles.inputContainer}>
      {isPassword ? (
        <input
          className={styles.input}
          type={isHidden ? "password" : "text"}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e);
          }}
        />
      ) : (
        <input
          className={styles.input}
          type={type}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e);
          }}
        />
      )}
      <Image
        src={
          isPassword
            ? isHidden
              ? "https://api.iconify.design/tabler:eye-closed.svg?color=%23A4A5B5"
              : "https://api.iconify.design/tabler:eye.svg?color=%23A4A5B5"
            : url
            ? url
            : ""
        }
        alt="toggle visibility"
        width={24}
        height={24}
        className={styles.image}
        onClick={isPassword ? () => setIsHidden(!isHidden) : () => {}}
        style={{ cursor: "pointer" }}
      />
    </div>
  );
};

export default StartButton;
