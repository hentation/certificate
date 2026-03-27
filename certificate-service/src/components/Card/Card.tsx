import type { ReactNode } from 'react';
import styles from './Card.styles.module.less';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className: customClassName }: CardProps) => {
  return (
    <div className={`${styles.cardStyle} ${customClassName || ''}`}>
      {children}
    </div>
  );
};
