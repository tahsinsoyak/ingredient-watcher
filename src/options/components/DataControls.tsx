import React, { useState } from 'react';
import { exportData, importData, clearAllData } from '@shared/lib/storage';
import Button from '@shared/components/Button';
import Card from '@shared/components/Card';
import Toast from '@shared/components/Toast';

export function DataControls(): React.ReactElement {
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error' | 'info'>('info');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string, variant: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  };

  const handleExport = async () => {
    try {
      const dataStr = await exportData();
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `ingredient_watcher_backup_${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showToast('Watchlist data exported successfully!', 'success');
    } catch (e) {
      showToast('Export failed: ' + String(e), 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = async (event) => {
      try {
        const fileContent = event.target?.result as string;
        await importData(fileContent);
        showToast('Watchlist data imported successfully! Reloading...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        showToast('Import failed: Invalid backup file.', 'error');
      }
    };
    fileReader.readAsText(file);
  };

  const handleClearAll = async () => {
    if (window.confirm('WARNING: This will permanently delete ALL watchlist ingredients, false positives, settings, and domain rules. This action cannot be undone. Proceed?')) {
      await clearAllData();
      showToast('All local storage data cleared. Resetting...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Export & Import Data</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Backup your custom terms, rules, and configuration settings locally or transfer them to another browser.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" onClick={handleExport}>
            Export Backup File
          </Button>

          <label className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors">
            Import Backup File
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </Card>

      <Card className="p-6 border-red-200 dark:border-red-900/30">
        <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Permanently erase all of your custom ingredient terms, ignores, rules, and settings from this browser's local database.
        </p>
        <Button variant="danger" onClick={handleClearAll}>
          Reset and Clear All Extension Data
        </Button>
      </Card>

      <Toast
        message={toastMessage}
        variant={toastVariant}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
