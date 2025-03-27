// import { useState } from "react";
// import styles from "./Input.module.scss";
// import Image from "next/image";

// const StartButton = ({
//   url,
//   onChange,
//   type,
//   placeholder,
// }: {
//   url?: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   type?: string;
//   placeholder: string;
// }) => {
//   const [isShow, setIsShow] = useState<boolean>(true);

//   return (
//     <div className={styles.inputContainer}>
//       <input
//         className={styles.input}
//         type={type}
//         placeholder={placeholder}
//         onChange={(e) => {
//           onChange(e);
//         }}
//       ></input>
//       <Image
//         src={url ? url : ""}
//         alt="book"
//         width={24}
//         height={24}
//         className={styles.image}
//       />
//     </div>
//   );
// };

// export default StartButton;

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
        onClick={isPassword ? () => setIsHidden(!isHidden) : () => {}} // クリックで状態を切り替え
        style={{ cursor: "pointer" }} // クリックできるように
      />
    </div>
  );
};

export default StartButton;
