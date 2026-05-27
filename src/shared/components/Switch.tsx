import React, { useId } from 'react';

// ─── Types ───────────────────────────────────────────────────────

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
}

// ─── Component ───────────────────────────────────────────────────

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  id: externalId,
  disabled = false,
}) => {
  const autoId = useId();
  const switchId = externalId ?? autoId;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="inline-flex items-center gap-2.5">
      <button
        id={switchId}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label && !label ? undefined : label}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={[
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
          checked
            ? 'bg-brand-600'
            : 'bg-slate-300 dark:bg-slate-600',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm',
            'transform transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-[18px]' : 'translate-x-[2px]',
          ].join(' ')}
        />
      </button>

      {label && (
        <label
          htmlFor={switchId}
          className={[
            'text-sm font-medium text-slate-700 dark:text-slate-300',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          ].join(' ')}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Switch;
