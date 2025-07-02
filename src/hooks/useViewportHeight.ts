import { useState, useEffect } from 'react';

/**
 * Dynamic Viewport Height対応フック
 * モバイルブラウザのアドレスバー表示/非表示に対応
 */
export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    const setVH = () => {
      // 実際の表示可能高さを取得
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setViewportHeight(window.innerHeight);
    };

    // 初期設定
    setVH();

    // リサイズ時の更新
    const handleResize = () => {
      // デバウンス処理
      requestAnimationFrame(setVH);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Visual Viewport API対応（iOS Safari等）
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return viewportHeight;
};

/**
 * キーボード表示状態検知フック
 */
export const useKeyboardDetection = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    let initialViewportHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // キーボードが表示されているかを判定（150px以上の高さ差）
      const isVisible = heightDifference > 150;
      setIsKeyboardVisible(isVisible);
      setKeyboardHeight(isVisible ? heightDifference : 0);
    };

    // 初期値設定
    initialViewportHeight = window.innerHeight;

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};

/**
 * メディアクエリフック
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};
