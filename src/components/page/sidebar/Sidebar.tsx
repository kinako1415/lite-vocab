import { useState } from "react";
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
