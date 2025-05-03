import React, { useState } from "react";
import styles from "./WordsContent.module.scss";
import { useAtomValue } from "jotai";
import { activeBoxesAtom, boxesAtom } from "@/store/boxesAtom";
import { Button } from "../elements/Button";
import { wordsCacheAtom } from "@/store/wordsAtom";
import { WordsModal } from "../WordsModal";

export const WordsContent: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wordBoxes = useAtomValue(boxesAtom);
  const activeBoxes = useAtomValue(activeBoxesAtom);
  const wordsCache = useAtomValue(wordsCacheAtom);

  return (
    <div className={styles.container}>
      <WordsModal setIsOpen={setIsOpen} isOpen={isOpen} />
      <div className={styles.titleContainer}>
        {wordBoxes
          ?.filter((data) => data.id === activeBoxes)
          .map((data) => (
            <div key={data.id} className={styles.name}>
              {data.name}
            </div>
          ))}
        <Button color="gray" onClick={() => setIsOpen(!isOpen)}>
          +
        </Button>
      </div>
      <div className={styles.buttonContainer}>
        {wordsCache[activeBoxes]?.map((data, i) => {
          return (
            <Button color="gray" key={i}>
              {data.meaning}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
