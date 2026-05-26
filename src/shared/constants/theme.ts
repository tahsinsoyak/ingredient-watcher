export const LIGHT_THEME = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#16A34A',
  accent: '#2563EB',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#E2E8F0',
} as const;

export const DARK_THEME = {
  background: '#020617',
  surface: '#0F172A',
  elevated: '#1E293B',
  text: '#F8FAFC',
  muted: '#94A3B8',
  primary: '#22C55E',
  accent: '#60A5FA',
  warning: '#FBBF24',
  danger: '#F87171',
  border: '#334155',
} as const;

export const HIGHLIGHT_COLORS = {
  warning: {
    background: 'rgba(251, 191, 36, 0.18)',
    border: 'rgba(239, 68, 68, 0.45)',
    text: '#92400E',
    darkText: '#FDE68A',
  },
  notice: {
    background: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.4)',
    text: '#1E40AF',
    darkText: '#93C5FD',
  },
  info: {
    background: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.4)',
    text: '#166534',
    darkText: '#86EFAC',
  },
} as const;
