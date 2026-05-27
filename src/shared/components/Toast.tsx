import React, { useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  onClose: () => void;
  autoDismissMs?: number;
}

// ─── Style Maps ──────────────────────────────────────────────────

const variantClasses: Record<ToastVariant, string> = {
  success:
    'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
  error:
    'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
  info:
    'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
};

const iconPaths: Record<ToastVariant, React.ReactNode> = {
  success: (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  ),
  error: (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  ),
  info: (
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clipRule="evenodd"
    />
  ),
};

// ─── Component ───────────────────────────────────────────────────

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  visible,
  onClose,
  autoDismissMs,
}) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!visible || !autoDismissMs) return;

    const timer = setTimeout(handleClose, autoDismissMs);
    return () => clearTimeout(timer);
  }, [visible, autoDismissMs, handleClose]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'fixed bottom-4 right-4 z-50 flex items-center gap-3',
        'max-w-sm rounded-lg border px-4 py-3 shadow-lg',
        'animate-slide-in',
        variantClasses[variant],
      ].join(' ')}
    >
      {/* Icon */}
      <svg
        className="h-5 w-5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        {iconPaths[variant]}
      </svg>

      {/* Message */}
      <p className="flex-1 text-sm font-medium">{message}</p>

      {/* Close Button */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Dismiss notification"
        className={[
          'shrink-0 rounded-md p-1',
          'transition-colors duration-150',
          'hover:bg-black/10 dark:hover:bg-white/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current',
        ].join(' ')}
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
