import React, { useEffect, useRef } from 'react';
import styles from './NavigationDrawer.module.scss';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  overlay?: boolean;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'left',
  overlay = true
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 背景スクロールを防止
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // フォーカストラップ
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const focusableElements = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    drawer.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      drawer.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  return (
    <>
      {/* オーバーレイ */}
      {overlay && (
        <div
          ref={overlayRef}
          className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ドロワー */}
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${styles[position]} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="ナビゲーションメニュー"
      >
        <div className={styles.drawerContent}>
          {children}
        </div>
      </div>
    </>
  );
};
