import React from "react";
import styles from "./WordsContent.module.scss";
import { useAtomValue } from "jotai";
import { activeBoxesAtom, boxesAtom } from "@/store/boxesAtom";
import { Button } from "../elements/Button";
import { wordsCacheAtom } from "@/store/wordsAtom";

export const WordsContent: React.FC = () => {
  const wordBoxes = useAtomValue(boxesAtom);
  const activeBoxes = useAtomValue(activeBoxesAtom);
  const wordsCache = useAtomValue(wordsCacheAtom);

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        {wordBoxes
          ?.filter((data) => data.id === activeBoxes)
          .map((data) => (
            <div key={data.id} className={styles.name}>
              {data.name}
            </div>
          ))}
        <Button color="gray">+</Button>
      </div>
      <div className={styles.buttonContainer}>
        {wordsCache[activeBoxes]?.map((data, i) => {
          return (
            <Button key={i} color="gray">
              {data.meaning}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
