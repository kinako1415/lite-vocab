import { useState } from "react";
import { Button } from "../elements/Button";
import { OutlineButton } from "../elements/OutlineButton";
import styles from "./Left.module.scss";
import { WordModal } from "../WordModal";
import { useAtomValue } from "jotai";
import { boxesAtom } from "@/store/boxesAtom";

export const Left = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // const wordBoxes = ["形容詞まとめ", "名詞まとめ", "簡単単語集"];

  const wordBoxes = useAtomValue(boxesAtom);
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
        {wordBoxes &&
          wordBoxes.map((boxName, i) => (
            <Button key={i}>{boxName.name}</Button>
          ))}
      </div>
    </div>
  );
};
