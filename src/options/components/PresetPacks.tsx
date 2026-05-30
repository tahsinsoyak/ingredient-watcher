import React, { useState } from 'react';
import { useWatchlistStore } from '@shared/store/useWatchlistStore';
import { useSettingsStore } from '@shared/store/useSettingsStore';
import { PRESET_PACKS } from '@shared/constants/presetIngredients';
import { getCategoryMeta } from '@shared/constants/categories';
import { useStrings } from '@shared/lib/i18n';
import { WarningIcon, CheckIcon } from '@shared/components/Icons';
import type { PresetPack } from '@shared/types/ingredients';

function PackCard({ pack }: { pack: PresetPack }): React.ReactElement {
  const strings = useStrings();
  const [expanded, setExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const enabledPacks = useSettingsStore((s) => s.enabledPresetPacks);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const importPresetPack = useWatchlistStore((s) => s.importPresetPack);
  const removePresetPack = useWatchlistStore((s) => s.removePresetPack);
  const cat = getCategoryMeta(pack.category);
  const isAdded = enabledPacks.includes(pack.id);

  const handleToggle = async () => {
    setAnimating(true);
    if (isAdded) {
      await removePresetPack(pack.id);
      await updateSettings({
        enabledPresetPacks: enabledPacks.filter((id) => id !== pack.id),
      });
    } else {
      await importPresetPack(pack.id);
      await updateSettings({
        enabledPresetPacks: [...enabledPacks, pack.id],
      });
    }
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <div
      className={`
        rounded-2xl border transition-all duration-300 overflow-hidden
        ${
          isAdded
            ? 'border-brand-300 dark:border-brand-700 bg-brand-50/30 dark:bg-brand-900/10'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark'
        }
        hover:shadow-md dark:hover:shadow-slate-900/50
        ${animating ? 'animate-scale-in' : ''}
      `}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: cat.color + '15' }}
          >
            {cat.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {pack.name}
            </h3>
            <span
              className="inline-flex mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{ backgroundColor: cat.color + '18', color: cat.color }}
            >
              {cat.label}
            </span>
          </div>
          {isAdded && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 animate-check-pop">
              <CheckIcon className="w-3 h-3" />
              Added
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          {pack.description}
        </p>

        {/* Term count */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {pack.terms.length} term{pack.terms.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleToggle()}
            className={`
              flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900
              ${
                isAdded
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/40 focus:ring-red-400'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm focus:ring-brand-500'
              }
            `}
          >
            {isAdded ? strings.presetPacks.removeAll : strings.presetPacks.addAll}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600
              text-sm font-medium text-slate-600 dark:text-slate-400
              hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'Show'} terms in ${pack.name}`}
          >
            {expanded ? 'Hide' : strings.presetPacks.preview}
          </button>
        </div>
      </div>

      {/* Expanded Terms */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700/60 pt-4 animate-slide-in">
          <div className="space-y-1.5">
            {pack.terms.map((term, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1">
                  {term.label}
                </span>
                {term.aliases.length > 0 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                    {term.aliases.slice(0, 3).join(', ')}
                    {term.aliases.length > 3 && ` +${term.aliases.length - 3}`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PresetPacks(): React.ReactElement {
  const strings = useStrings();
  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40">
        <WarningIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
          {strings.presetPacks.disclaimer}
        </p>
      </div>

      {/* Pack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Preset ingredient packs">
        {PRESET_PACKS.map((pack) => (
          <div key={pack.id} role="listitem">
            <PackCard pack={pack} />
          </div>
        ))}
      </div>
    </div>
  );
}
