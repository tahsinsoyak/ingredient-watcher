import React, { useId } from 'react';

// ─── Types ───────────────────────────────────────────────────────

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url';
  className?: string;
  id?: string;
  disabled?: boolean;
}

// ─── Component ───────────────────────────────────────────────────

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = 'text',
  className = '',
  id: externalId,
  disabled = false,
}) => {
  const autoId = useId();
  const inputId = externalId ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={[
          'w-full rounded-lg border px-3 py-2 text-sm',
          'bg-white dark:bg-slate-900',
          'text-slate-900 dark:text-slate-100',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900',
          error
            ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
            : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500 focus:border-brand-500',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      />

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-500 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
