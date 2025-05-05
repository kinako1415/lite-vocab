import React, { useState } from "react";
import styles from "./WordsContent.module.scss";
import { useAtomValue } from "jotai";
import { activeBoxesAtom, boxesAtom } from "@/store/boxesAtom";
import { wordsCacheAtom } from "@/store/wordsAtom";
import { WordsModal } from "../WordsModal";
import { IconButton } from "../elements/IconButton";
import { WordsCard } from "./WordsCard";

export const WordsContent: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wordBoxes = useAtomValue(boxesAtom);
  const activeBoxes = useAtomValue(activeBoxesAtom);
  const wordsCache = useAtomValue(wordsCacheAtom);

  return (
    <>
      {activeBoxes !== undefined && (
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
            <IconButton
              url="https://api.iconify.design/heroicons:plus-16-solid.svg?color=%237750d3"
              onClick={() => setIsOpen(!isOpen)}
            ></IconButton>
          </div>
          <div className={styles.buttonContainer}>
            {wordsCache[activeBoxes]?.map((data, i) => {
              return (
                <WordsCard meaning={data.meaning} word={data.word} key={i} />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
