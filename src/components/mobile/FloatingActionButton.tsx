import React from 'react';
import styles from './FloatingActionButton.module.scss';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  position?: 'bottom-right' | 'bottom-left';
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  const handleClick = () => {
    // 振動フィードバック（サポートされている場合）
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
    onClick();
  };

  return (
    <button
      className={`
        ${styles.fab}
        ${styles[position]}
        ${styles[variant]}
        ${styles[size]}
        ${disabled ? styles.disabled : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <span className={styles.iconWrapper}>
        {icon}
      </span>
      <span className={styles.ripple}></span>
    </button>
  );
};
