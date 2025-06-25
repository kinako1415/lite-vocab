"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OutlineButton } from "../../elements/OutlineButton";
import styles from "./Sidebar.module.scss";
import { BoxesModal } from "./BoxesModal";
import { useAtom, useAtomValue } from "jotai";
import { activeBoxesAtom, boxesAtom } from "@/store/boxesAtom";
import { BoxesCard } from "./BoxesCard";
import { wordsCacheAtom } from "@/store/wordsAtom";
import { getWord } from "@/lib/firestore";
import { UserProfile } from "./UserProfile";

export const Sidebar = () => {
  const router = useRouter();
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

  const handleStartQuiz = (boxId?: string) => {
    const targetBoxId = boxId || activeBoxes;
    if (targetBoxId) {
      // 指定された単語帳でクイズを開始
      router.push(`/quiz?boxId=${targetBoxId}`);
    } else {
      // 単語帳が選択されていない場合は、サンプルクイズを開始
      router.push("/quiz");
    }
  };

  return (
    <div className={styles.container}>
      <BoxesModal setIsOpen={setIsOpen} isOpen={isOpen} />
      <div className={styles.topContent}>
        <div className={styles.titleContainer}>
          <div className={styles.logo}>liteVocab</div>
          <div className={styles.buttonContainer}>
            <OutlineButton
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            >
              単語まとめの作成
            </OutlineButton>
            <OutlineButton onClick={() => handleStartQuiz()}>
              クイズを始める
            </OutlineButton>
          </div>
        </div>
        <div className={styles.boxContainer}>
          {wordBoxes &&
            wordBoxes.map((data, i) => (
              <BoxesCard
                key={i}
                isActive={data.id === activeBoxes}
                activeBoxId={data.id}
                onClick={() => {
                  const nextActive =
                    data.id === activeBoxes ? undefined : data.id;
                  setActiveBoxes(nextActive);
                  handleClick(data.id);
                }}
                boxName={data.name}
                onStartQuiz={() => handleStartQuiz(data.id)}
              >
                {data.name}
              </BoxesCard>
            ))}
        </div>
      </div>

      {/* UserProfileを下部に配置 */}
      <div className={styles.profileContainer}>
        <UserProfile />
      </div>
    </div>
  );
};
