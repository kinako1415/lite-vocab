import { useState } from "react";
import { OutlineButton } from "../elements/OutlineButton";
import styles from "./Left.module.scss";
import { BoxesModal } from "../BoxesModal";
import { useAtom, useAtomValue } from "jotai";
import { activeBoxesAtom, boxesAtom } from "@/store/boxesAtom";
import { ToggleButton } from "../elements/ToggleButton";
import { wordsCacheAtom } from "@/store/wordsAtom";
import { getWord } from "@/lib/firestore";

export const Left = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [wordsCache, setWordsCache] = useAtom(wordsCacheAtom);

  const [activeBoxes, setActiveBoxes] = useAtom(activeBoxesAtom);
  const wordBoxes = useAtomValue(boxesAtom);

  const handleClick = async (boxId: string) => {
    if (!wordsCache[boxId]) {
      const words = await getWord(boxId);
      setWordsCache((prev) => ({
        ...prev,
        [boxId]: words,
      }));
    }
  };

  return (
    <div className={styles.container}>
      <BoxesModal setIsOpen={setIsOpen} isOpen={isOpen} />
      <div className={styles.logo}>liteVocab</div>
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
            <ToggleButton
              key={i}
              isActive={boxName.id === activeBoxes}
              onClick={() => {
                const nextActive =
                  boxName.id === activeBoxes ? undefined : boxName.id;
                console.log(nextActive);
                setActiveBoxes(nextActive);
                handleClick(boxName.id);
              }}
            >
              {boxName.name}
            </ToggleButton>
          ))}
      </div>
    </div>
  );
};
