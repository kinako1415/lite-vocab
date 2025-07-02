import { useState, useCallback, useEffect } from "react";

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: Record<string, unknown> | null;
}

interface NetworkState {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
}

interface ErrorHandlerOptions {
  enableNetworkMonitoring?: boolean;
  enableErrorReporting?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Network Connection API型定義
interface NetworkConnection {
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
}

/**
 * エラーハンドリングとネットワーク監視のカスタムフック
 */
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    enableNetworkMonitoring = true,
    enableErrorReporting = true,
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: "unknown",
  });

  const [retryCount, setRetryCount] = useState(0);

  // ネットワーク状態の監視
  useEffect(() => {
    if (!enableNetworkMonitoring) return;

    const handleOnline = () => {
      setNetworkState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setNetworkState((prev) => ({ ...prev, isOnline: false }));
    };

    // 接続タイプの監視（サポートされている場合）
    const updateConnectionInfo = () => {
      const connection =
        (navigator as NavigatorWithConnection).connection ||
        (navigator as NavigatorWithConnection).mozConnection ||
        (navigator as NavigatorWithConnection).webkitConnection;
      if (connection) {
        setNetworkState((prev) => ({
          ...prev,
          connectionType: connection.effectiveType || "unknown",
          isSlowConnection:
            connection.effectiveType === "slow-2g" ||
            connection.effectiveType === "2g",
        }));
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 初回接続情報取得
    updateConnectionInfo();

    // 接続変更の監視
    const connection = (navigator as NavigatorWithConnection).connection;
    if (connection) {
      connection.addEventListener?.("change", updateConnectionInfo);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener?.("change", updateConnectionInfo);
      }
    };
  }, [enableNetworkMonitoring]);

  // エラーの処理
  const handleError = useCallback(
    (error: Error, errorInfo?: Record<string, unknown>) => {
      setErrorState({
        hasError: true,
        error,
        errorInfo: errorInfo || null,
      });

      // エラーレポーティング（本番環境のみ）
      if (enableErrorReporting && process.env.NODE_ENV === "production") {
        console.error("Error captured:", error, errorInfo);
        // 実際のエラーレポーティングサービスに送信
        // reportError(error, errorInfo);
      }
    },
    [enableErrorReporting]
  );

  // エラーのクリア
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    setRetryCount(0);
  }, []);

  // 自動リトライ機能
  const retryWithDelay = useCallback(
    async (operation: () => Promise<void>) => {
      if (retryCount >= retryAttempts) {
        throw new Error("Maximum retry attempts reached");
      }

      try {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, retryCount))
        );
        await operation();
        setRetryCount(0);
      } catch (error) {
        setRetryCount((prev) => prev + 1);
        throw error;
      }
    },
    [retryCount, retryAttempts, retryDelay]
  );

  // エラーメッセージの生成
  const getErrorMessage = useCallback(
    (error: Error) => {
      if (!networkState.isOnline) {
        return "インターネット接続を確認してください";
      }

      if (networkState.isSlowConnection) {
        return "接続が不安定です。しばらくお待ちください";
      }

      switch (error.name) {
        case "NetworkError":
          return "ネットワークエラーが発生しました";
        case "TimeoutError":
          return "リクエストがタイムアウトしました";
        case "AuthenticationError":
          return "認証エラーが発生しました。再度ログインしてください";
        case "ValidationError":
          return "入力内容に問題があります";
        default:
          return error.message || "予期しないエラーが発生しました";
      }
    },
    [networkState]
  );

  // エラーの重要度判定
  const getErrorSeverity = useCallback(
    (error: Error): "low" | "medium" | "high" | "critical" => {
      if (error.name === "AuthenticationError") return "critical";
      if (error.name === "NetworkError") return "high";
      if (error.name === "ValidationError") return "medium";
      return "low";
    },
    []
  );

  return {
    // エラー状態
    errorState,
    hasError: errorState.hasError,
    error: errorState.error,

    // ネットワーク状態
    networkState,
    isOnline: networkState.isOnline,
    isSlowConnection: networkState.isSlowConnection,

    // エラーハンドリング
    handleError,
    clearError,
    retryWithDelay,

    // ユーティリティ
    getErrorMessage,
    getErrorSeverity,
    retryCount,
    canRetry: retryCount < retryAttempts,
  };
};
