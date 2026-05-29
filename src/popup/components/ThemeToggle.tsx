import React from 'react';
import { useThemeStore } from '@shared/store/useThemeStore';
import Button from '@shared/components/Button';
import { SunIcon, MoonIcon, MonitorIcon } from '@shared/components/Icons';

export function ThemeToggle(): React.ReactElement {
  const { theme, setTheme } = useThemeStore();

  const handleCycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getIcon = () => {
    if (theme === 'light') return <SunIcon className="w-4 h-4" />;
    if (theme === 'dark') return <MoonIcon className="w-4 h-4" />;
    return <MonitorIcon className="w-4 h-4" />;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCycle}
      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      title={`Theme: ${theme}`}
    >
      <span className="text-sm">{getIcon()}</span>    </Button>
  );
}
