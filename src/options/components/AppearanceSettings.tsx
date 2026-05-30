import React from 'react';
import { useThemeStore } from '@shared/store/useThemeStore';
import { useLocaleStore } from '@shared/store/useLocaleStore';
import { useStrings } from '@shared/lib/i18n';
import Card from '@shared/components/Card';

export function AppearanceSettings(): React.ReactElement {
  const strings = useStrings();
  const themeState = useThemeStore();
  const { locale, setLocale } = useLocaleStore();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Appearance Settings</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Customize the visual presentation and language of the extension.
        </p>

        <div className="space-y-6">
          {/* Theme */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme Mode</span>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => themeState.setTheme(mode)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all border
                    ${
                      themeState.theme === mode
                        ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{strings.options.language}</span>
            <div className="flex gap-2">
              {([{ value: 'en', label: 'English' }, { value: 'tr', label: 'T\u00FCrk\u00E7e' }] as const).map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => void setLocale(lang.value)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold transition-all border
                    ${
                      locale === lang.value
                        ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
export default AppearanceSettings;
