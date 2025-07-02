import { useState, useEffect, useCallback } from "react";

type Handedness = "left" | "right" | "auto";

interface HandednessSettings {
  handedness: Handedness;
  reachabilityMode: boolean; // 到達性モード
  primaryActionSide: "left" | "right";
}

/**
 * 利き手対応フック
 */
export const useHandedness = () => {
  const [settings, setSettings] = useState<HandednessSettings>({
    handedness: "auto",
    reachabilityMode: false,
    primaryActionSide: "right",
  });

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("handedness-settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn("Failed to load handedness settings:", error);
    }
  }, []);

  // 設定をローカルストレージに保存
  const saveSettings = useCallback(
    (newSettings: Partial<HandednessSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      try {
        localStorage.setItem(
          "handedness-settings",
          JSON.stringify(updatedSettings)
        );
      } catch (error) {
        console.warn("Failed to save handedness settings:", error);
      }
    },
    [settings]
  );

  // 自動検知（タッチパターンの分析）
  const detectHandedness = useCallback(() => {
    // 実装予定: タッチ座標の分析により利き手を推定
    // 現在はデフォルト値を返す
    return "right" as const;
  }, []);

  // 利き手に基づくクラス名の生成
  const getHandednessClass = useCallback(
    (baseClass: string) => {
      const suffix =
        settings.handedness === "left" ? "left-handed" : "right-handed";
      return `${baseClass} ${baseClass}--${suffix}`;
    },
    [settings.handedness]
  );

  // 到達可能エリアの判定
  const isReachable = useCallback(
    (position: { x: number; y: number }) => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // 親指の到達範囲（画面サイズに基づく）
      const thumbReach = Math.min(screenWidth, screenHeight) * 0.75;

      let thumbOrigin: { x: number; y: number };

      if (settings.handedness === "left") {
        thumbOrigin = { x: 0, y: screenHeight };
      } else {
        thumbOrigin = { x: screenWidth, y: screenHeight };
      }

      const distance = Math.sqrt(
        Math.pow(position.x - thumbOrigin.x, 2) +
          Math.pow(position.y - thumbOrigin.y, 2)
      );

      return distance <= thumbReach;
    },
    [settings.handedness]
  );

  return {
    settings,
    saveSettings,
    detectHandedness,
    getHandednessClass,
    isReachable,
    // 便利なヘルパー
    isLeftHanded: settings.handedness === "left",
    isRightHanded: settings.handedness === "right",
    primaryActionSide: settings.primaryActionSide,
  };
};

/**
 * 到達性ヘルパーフック
 */
export const useReachability = () => {
  const { isReachable, settings } = useHandedness();

  // 要素が到達可能かチェック
  const checkElementReachability = useCallback(
    (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      return isReachable(center);
    },
    [isReachable]
  );

  // 到達困難エリアのスタイル調整
  const getReachabilityStyles = useCallback(
    (isInReachableArea: boolean) => {
      if (!settings.reachabilityMode) return {};

      return {
        opacity: isInReachableArea ? 1 : 0.7,
        transition: "opacity 0.2s ease",
      };
    },
    [settings.reachabilityMode]
  );

  return {
    checkElementReachability,
    getReachabilityStyles,
    reachabilityMode: settings.reachabilityMode,
  };
};
