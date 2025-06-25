import { useState, useCallback, useRef, useEffect } from "react";
import { AnswerType } from "@/types/quiz";

interface SwipeHandler {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeDown: () => void;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
}: SwipeHandler) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<AnswerType | null>(null);

  const startPos = useRef({ x: 0, y: 0 });
  const threshold = 100; // スワイプと判定する最小距離

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
  }, []);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const deltaX = clientX - startPos.current.x;
      const deltaY = clientY - startPos.current.y;

      setDragOffset({ x: deltaX, y: deltaY });

      // スワイプ方向の予測
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > threshold || absY > threshold) {
        if (absX > absY) {
          // 横方向のスワイプ
          setSwipeDirection(deltaX > 0 ? "know" : "unknown");
        } else if (deltaY > 0) {
          // 下方向のスワイプ
          setSwipeDirection("vague");
        }
      } else {
        setSwipeDirection(null);
      }
    },
    [isDragging, threshold]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const absX = Math.abs(dragOffset.x);
    const absY = Math.abs(dragOffset.y);

    // スワイプ判定
    if (absX > threshold && absX > absY) {
      if (dragOffset.x > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    } else if (dragOffset.y > threshold && absY > absX) {
      onSwipeDown();
    }

    // リセット
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
  }, [
    isDragging,
    dragOffset,
    threshold,
    onSwipeLeft,
    onSwipeRight,
    onSwipeDown,
  ]);

  // マウスイベント
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // タッチイベント
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // グローバルマウスイベントの設定
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX, e.clientY);
      };

      const handleGlobalMouseUp = () => {
        handleEnd();
      };

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  return {
    dragOffset,
    isDragging,
    swipeDirection,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
