import React from 'react';

// ─── Types ───────────────────────────────────────────────────────

type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: CardPadding;
}

// ─── Style Maps ──────────────────────────────────────────────────

const paddingClasses: Record<CardPadding, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

// ─── Component ───────────────────────────────────────────────────

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) => {
  return (
    <div
      className={[
        'bg-white dark:bg-slate-900',
        'border border-slate-200 dark:border-slate-700',
        'rounded-xl shadow-sm',
        paddingClasses[padding],
        hover
          ? 'transition-shadow duration-200 hover:shadow-md'
          : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export default Card;
