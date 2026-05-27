import React from 'react';

// ─── Types ───────────────────────────────────────────────────────

type BadgeVariant = 'warning' | 'notice' | 'info' | 'category' | 'privacy';

interface BadgeProps {
  variant?: BadgeVariant;
  label: string;
  className?: string;
}

// ─── Style Maps ──────────────────────────────────────────────────

const variantClasses: Record<BadgeVariant, string> = {
  warning:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  notice:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  info:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  category:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  privacy:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

// ─── Shield Icon ─────────────────────────────────────────────────

function ShieldIcon() {
  return (
    <svg
      className="h-3 w-3 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 1a1 1 0 01.707.293l6 6A1 1 0 0117 8v4a7 7 0 11-14 0V8a1 1 0 01.293-.707l6-6A1 1 0 0110 1zm0 2.414L4 9.414V12a6 6 0 1012 0V9.414L10 3.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  label,
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
        'text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {variant === 'privacy' && <ShieldIcon />}
      {label}
    </span>
  );
};

export default Badge;
