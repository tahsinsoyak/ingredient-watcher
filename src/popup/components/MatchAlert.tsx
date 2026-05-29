import React from 'react';
import { useScanStore } from '@shared/store/useScanStore';
import Card from '@shared/components/Card';
import Badge from '@shared/components/Badge';

export function MatchAlert(): React.ReactElement {
  const { scanResult, scanning, error } = useScanStore();

  if (scanning) {
    return (
      <Card className="p-4 border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-slate-500 text-xs">
        Analyzing page content for watchlist matches...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 text-center text-red-600 dark:text-red-400 text-xs">
        ⚠ Scan failed: {error}
      </Card>
    );
  }

  if (!scanResult) {
    return (
      <Card className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-slate-500 text-xs">
        Click "Scan this Page" to run analysis.
      </Card>
    );
  }

  const { matches } = scanResult;
  if (matches.length === 0) {
    return (
      <Card className="p-4 border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 text-center text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
        <span>✓</span> No watchlist matches found!
      </Card>
    );
  }

  // Get highest severity
  const severities = matches.map(m => m.severity);
  const highestSeverity = severities.includes('warning') 
    ? 'warning' 
    : severities.includes('notice') 
      ? 'notice' 
      : 'info';

  const getAlertClasses = () => {
    if (highestSeverity === 'warning') {
      return 'border-amber-200/60 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/10 text-amber-800 dark:text-amber-300';
    }
    if (highestSeverity === 'notice') {
      return 'border-blue-200/60 dark:border-blue-800/40 bg-blue-50/40 dark:bg-blue-950/10 text-blue-800 dark:text-blue-300';
    }
    return 'border-green-200/60 dark:border-green-800/40 bg-green-50/40 dark:bg-green-950/10 text-green-800 dark:text-green-300';
  };

  return (
    <Card className={`p-4 border rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 text-center transition-all duration-300 ${getAlertClasses()}`}>
      <Badge variant={highestSeverity} label={`${highestSeverity.toUpperCase()} DETECTED`} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5" />
      <span className="text-sm font-extrabold tracking-tight">
        {matches.length} watchlist {matches.length === 1 ? 'match' : 'matches'} found
      </span>
    </Card>
  );
}
