import React, { useState, useMemo } from "react";
import styles from "./WordsContent.module.scss";
import { useAtomValue } from "jotai";
import { activeBoxesAtom, boxesAtom } from "@/store/boxesAtom";
import { WordsModal } from "./WordsModal";
import { WordUpdateModal } from "./sidebar/WordUpdateModal";
import { UrlImportModal } from "./sidebar/UrlImportModal";
import { IconButton } from "../elements/IconButton";
import { WordsCard } from "./WordsCard";
import { Words } from "@/types/word";

type UpdateModalState = {
  isOpen: boolean;
  word: Words | null;
};

export const WordsContent: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUrlImportOpen, setIsUrlImportOpen] = useState<boolean>(false);
  const [updateModal, setUpdateModal] = useState<UpdateModalState>({
    isOpen: false,
    word: null,
  });
  const wordBoxes = useAtomValue(boxesAtom);
  const activeBoxes = useAtomValue(activeBoxesAtom);

  // boxesAtomから直接単語データを取得（リアルタイム更新対応）
  const currentWords = useMemo(() => {
    if (!activeBoxes || !wordBoxes) return [];
    const activeBox = wordBoxes.find(box => box.id === activeBoxes);
    return activeBox?.words || [];
  }, [wordBoxes, activeBoxes]);

  const handleWordClick = (word: Words) => {
    setUpdateModal({
      isOpen: true,
      word,
    });
  };

  return (
    <>
      {activeBoxes !== undefined && (
        <div className={styles.container}>
          <WordsModal setIsOpen={setIsOpen} isOpen={isOpen} />
          <UrlImportModal
            setIsOpen={setIsUrlImportOpen}
            isOpen={isUrlImportOpen}
            boxesId={activeBoxes}
          />
          {updateModal.word && (
            <WordUpdateModal
              setIsOpen={(isOpen: boolean) =>
                setUpdateModal((prev) => ({ ...prev, isOpen }))
              }
              isOpen={updateModal.isOpen}
              boxesId={activeBoxes}
              wordId={updateModal.word.id}
              initialWord={updateModal.word.word}
              initialMeaning={updateModal.word.meaning}
            />
          )}
          <div className={styles.titleContainer}>
            {wordBoxes
              ?.filter((data) => data.id === activeBoxes)
              .map((data) => (
                <div key={data.id} className={styles.name}>
                  {data.name}
                </div>
              ))}
            <div className={styles.buttonGroup}>
              <IconButton
                url="https://api.iconify.design/material-symbols:link.svg?color=%237750d3"
                onClick={() => setIsUrlImportOpen(true)}
              />
              <IconButton
                url="https://api.iconify.design/heroicons:plus-16-solid.svg?color=%237750d3"
                onClick={() => setIsOpen(!isOpen)}
              />
            </div>
          </div>
          <div className={styles.buttonContainer}>
            {currentWords?.map((data, i) => {
              return (
                <WordsCard
                  meaning={data.meaning}
                  word={data.word}
                  key={i}
                  onClick={() => handleWordClick(data)}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
