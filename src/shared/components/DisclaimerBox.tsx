import React from 'react';
import { strings } from '@shared/lib/i18n';
import { WarningIcon } from '@shared/components/Icons';

// ─── Types ───────────────────────────────────────────────────────

interface DisclaimerBoxProps {
  compact?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────

export const DisclaimerBox: React.FC<DisclaimerBoxProps> = ({
  compact = false,
  className = '',
}) => {
  return (
    <div
      role="note"
      aria-label="Disclaimer"
      className={[
        'rounded-lg border',
        'bg-amber-50/50 dark:bg-amber-950/20',
        'border-amber-200/60 dark:border-amber-800/40',
        compact ? 'px-2.5 py-1.5' : 'px-3 py-2.5',
        className,
      ].join(' ')}
    >
      {compact ? (
        <p className="text-[10px] leading-tight text-amber-700/80 dark:text-amber-400/70">
          <span className="font-semibold"><WarningIcon className="w-3 h-3 inline" /> {strings.disclaimer.short}.</span>{' '}
          Always verify labels independently.
        </p>
      ) : (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            <WarningIcon className="w-3.5 h-3.5 inline" /> {strings.disclaimer.short}
          </p>
          <p className="text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-400/80">
            {strings.disclaimer.full}
          </p>
        </div>
      )}
    </div>
  );
};

export default DisclaimerBox;
