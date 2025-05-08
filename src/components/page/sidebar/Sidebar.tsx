import { useState } from "react";
import { OutlineButton } from "../../elements/OutlineButton";
import styles from "./Sidebar.module.scss";
import { BoxesModal } from "./BoxesModal";
import { useAtom, useAtomValue } from "jotai";
import { activeBoxesAtom, boxesAtom } from "@/store/boxesAtom";
import { BoxesCard } from "./BoxesCard";
import { wordsCacheAtom } from "@/store/wordsAtom";
import { getWord } from "@/lib/firestore";
import { translateWord } from "@/lib/gemini";
import { Button } from "@/components/elements/Button";

export const Sidebar = () => {
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

  const handleClick2 = async () => {
    const result = await translateWord("좋아하다");
    console.log(result);
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
            <BoxesCard
              key={i}
              isActive={boxName.id === activeBoxes}
              activeBoxId={boxName.id}
              onClick={() => {
                const nextActive =
                  boxName.id === activeBoxes ? undefined : boxName.id;
                console.log(nextActive);
                setActiveBoxes(nextActive);
                handleClick(boxName.id);
              }}
              boxName={boxName.name}
            >
              {boxName.name}
            </BoxesCard>
          ))}
      </div>
      <Button onClick={handleClick2}>翻訳</Button>
    </div>
  );
};
