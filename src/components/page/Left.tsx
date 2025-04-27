import { useState } from "react";
import { Button } from "../elements/Button";
import { OutlineButton } from "../elements/OutlineButton";
import styles from "./Left.module.scss";
import { WordModal } from "../WordModal";
import { getBox } from "@/lib/firestore";

export const Left = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wordBoxes = ["形容詞まとめ", "名詞まとめ", "簡単単語集"];
  return (
    <div className={styles.container}>
      <WordModal setIsOpen={setIsOpen} isOpen={isOpen} />
      <OutlineButton
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        単語まとめの作成
      </OutlineButton>
      <div className={styles.boxContainer}>
        {wordBoxes.map((boxName, i) => (
          <Button key={i} onClick={() => getBox}>
            {boxName}
          </Button>
        ))}
      </div>
    </div>
  );
};
