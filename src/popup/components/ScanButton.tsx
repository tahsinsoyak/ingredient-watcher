import React from 'react';
import { useScanStore } from '@shared/store/useScanStore';
import Button from '@shared/components/Button';
import { SearchIcon } from '@shared/components/Icons';

export function ScanButton(): React.ReactElement {
  const { scanning, startScan, setScanResult } = useScanStore();

  const handleScan = async () => {
    startScan();
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'SCAN_PAGE' }, (response) => {
        if (response?.success && response.result) {
          setScanResult(response.result);
        } else if (response?.error) {
          useScanStore.getState().clearScan();
        }
      });
    }
  };

  return (
    <Button
      variant="primary"
      size="lg"
      loading={scanning}
      onClick={handleScan}
      className="w-full max-w-xs shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 transition-all duration-300 font-extrabold tracking-wide py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-98 rounded-xl text-sm border-0"
    >
      {scanning ? (
        <span className="flex items-center gap-2">Checking visible ingredients...</span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <SearchIcon className="w-4 h-4" /> Scan Page
        </span>
      )}
    </Button>
  );
}
