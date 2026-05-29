import React, { useEffect } from 'react';
import { useWatchlistStore } from '@shared/store/useWatchlistStore';
import { useScanStore } from '@shared/store/useScanStore';
import { strings } from '@shared/lib/i18n';
import Button from '@shared/components/Button';
import DisclaimerBox from '@shared/components/DisclaimerBox';
import { LeafIcon, GearIcon } from '@shared/components/Icons';
import { WatchlistSummary } from './components/WatchlistSummary';
import { ScanButton } from './components/ScanButton';
import { MatchAlert } from './components/MatchAlert';
import { MatchList } from './components/MatchList';
import { QuickAddTerm } from './components/QuickAddTerm';
import { ThemeToggle } from './components/ThemeToggle';

export function PopupApp(): React.ReactElement {
  const loadTerms = useWatchlistStore((s) => s.loadTerms);
  const loadLastScanResult = useScanStore((s) => s.loadLastScanResult);
  const scanResult = useScanStore((s) => s.scanResult);
  
  useEffect(() => {
    void loadTerms();
    void loadLastScanResult();
  }, [loadTerms, loadLastScanResult]);

  const handleOpenOptions = () => {
    if (chrome?.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  return (
    <div className="w-[400px] min-h-[540px] max-h-[600px] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 antialiased selection:bg-brand-500/20">
      {/* Header */}
      <header className="px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-sm">
             <LeafIcon className="w-4 h-4 text-white" />
           </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{strings.app.name}</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium -mt-0.5">{strings.app.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleOpenOptions} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60">
            <GearIcon className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <WatchlistSummary />
        
        <div className="flex justify-center py-2">
          <ScanButton />
        </div>

        <MatchAlert />

        {scanResult && scanResult.matches.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Detected Ingredients
            </h3>
            <MatchList />
          </div>
        )}
      </main>

      {/* Footer / Quick Add */}
      <footer className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <QuickAddTerm />
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <DisclaimerBox compact={true} />
          <button onClick={handleOpenOptions} className="hover:underline text-brand-600 dark:text-brand-400 font-medium bg-transparent border-0 p-0 cursor-pointer">
            Open Settings
          </button>
        </div>
      </footer>
    </div>
  );
}
export default PopupApp;
