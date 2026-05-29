import React from 'react';
import { useScanStore } from '@shared/store/useScanStore';
import Card from '@shared/components/Card';
import Badge from '@shared/components/Badge';
import Button from '@shared/components/Button';
import { SearchIcon, BanIcon } from '@shared/components/Icons';
import { getCategoryMeta } from '@shared/constants/categories';

export function MatchList(): React.ReactElement {
  const { scanResult, markFalsePositive } = useScanStore();

  if (!scanResult || scanResult.matches.length === 0) return <></>;

  const handleHighlight = (matchedText: string, matchId: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id) {
          chrome.tabs.sendMessage(activeTab.id, {
            type: 'HIGHLIGHT_MATCH',
            payload: { matchId, matchedText },
          });
        }
      });
    }
  };

  const handleIgnore = async (matchId: string) => {
    await markFalsePositive(matchId, scanResult.domain);
  };

  return (
    <div className="space-y-2.5">
      {scanResult.matches.map((match) => {
        const catMeta = getCategoryMeta(match.category);
        return (
          <Card key={match.id} className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-slate-950 dark:text-white truncate">{match.matchedText}</span>
                <Badge variant="category" label={`${catMeta.icon} ${catMeta.label}`} />
              </div>
              <Badge variant={match.severity} label={match.severity.toUpperCase()} />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 italic font-mono bg-slate-50 dark:bg-slate-950/40 p-2 rounded border border-slate-100 dark:border-slate-900 leading-normal">
              {match.contextSnippet}
            </p>

            <div className="flex justify-end gap-1.5">
              <Button size="sm" variant="ghost" onClick={() => handleHighlight(match.matchedText, match.id)} className="text-[10px] px-2 py-1 inline-flex items-center gap-1">
                <SearchIcon className="w-3 h-3" /> Highlight
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleIgnore(match.id)} className="text-[10px] px-2 py-1 inline-flex items-center gap-1">
                <BanIcon className="w-3 h-3" /> Ignore Match
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
