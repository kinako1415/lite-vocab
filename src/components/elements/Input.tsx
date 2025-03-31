import { forwardRef, useState } from "react";
import styles from "./Input.module.scss";
import Image from "next/image";

type InputFieldProps = {
  url?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder: string;
  errors?: string;
  isPassword?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      url,
      onChange,
      type = "text",
      placeholder,
      errors,
      isPassword = false,
      ...rest
    },
    ref
  ) => {
    const [isHidden, setIsHidden] = useState<boolean>(true);

    return (
      <div className={styles.container}>
        <div className={styles.error}>{errors}</div>
        <div className={styles.inputContainer}>
          {isPassword ? (
            <input
              className={`${styles.input} ${errors ? styles.errorBorder : ""}`}
              type={isHidden ? "password" : "text"}
              placeholder={placeholder}
              onChange={(e) => {
                onChange(e);
              }}
              ref={ref}
              {...rest}
            />
          ) : (
            <input
              className={`${styles.input} ${errors ? styles.errorBorder : ""}`}
              type={type}
              placeholder={placeholder}
              onChange={(e) => {
                onChange(e);
              }}
              ref={ref}
              {...rest}
            />
          )}
          <Image
            src={
              isPassword
                ? isHidden
                  ? // ? "https://api.iconify.design/tabler:eye-closed.svg?color=%23A4A5B5"
                    "https://api.iconify.design/line-md:watch-off-loop.svg?color=%23A4A5B5"
                  : "https://api.iconify.design/line-md:watch-loop.svg?color=%23A4A5B5"
                : // : "https://api.iconify.design/tabler:eye.svg?color=%23A4A5B5"
                url
                ? url
                : ""
            }
            alt="toggle visibility"
            width={24}
            height={24}
            priority
            className={styles.image}
            onClick={isPassword ? () => setIsHidden(!isHidden) : () => {}}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";
