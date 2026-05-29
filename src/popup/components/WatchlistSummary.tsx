import React from 'react';
import { useWatchlistStore } from '@shared/store/useWatchlistStore';
import Card from '@shared/components/Card';
import Badge from '@shared/components/Badge';
import { strings } from '@shared/lib/i18n';

export function WatchlistSummary(): React.ReactElement {
  const terms = useWatchlistStore((s) => s.terms);
  const activeTermsCount = terms.filter((t) => t.enabled).length;

  const getUniqueCategories = () => {
    const cats = new Set(terms.filter((t) => t.enabled).map((t) => t.category));
    return cats.size;
  };

  return (
    <Card className="p-4 flex items-center justify-between gap-3 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl shadow-sm hover:shadow-md/50 transition-all duration-300">
      <div className="space-y-1">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Personal Watchlist</h4>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">
          <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">{activeTermsCount}</span> active terms across <span className="font-bold text-slate-900 dark:text-white">{getUniqueCategories()}</span> categories
        </p>
      </div>
      <Badge variant="privacy" label={strings.privacy.badge} className="shadow-sm border border-emerald-200/30 dark:border-emerald-500/10 text-[10px]" />
    </Card>
  );
}
