import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./StartButton.module.scss";

const StartButton = () => {
  return (
    <button className={styles.button}>
      <Icon
        icon="heroicons:play-solid"
        style={{
          fontSize: "40px",
          color: "#FFFFFF",
        }}
      />
    </button>
  );
};

export default StartButton;
