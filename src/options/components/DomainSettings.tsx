import React, { useState, useEffect } from 'react';
import { getDomainSettings, saveDomainSetting, deleteDomainSetting } from '@shared/lib/storage';
import type { DomainSetting } from '@shared/types/ingredients';
import Button from '@shared/components/Button';
import Card from '@shared/components/Card';
import Switch from '@shared/components/Switch';

export function DomainSettings(): React.ReactElement {
  const [domains, setDomains] = useState<DomainSetting[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [ignored, setIgnored] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const data = await getDomainSettings();
      setDomains(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    // Clean up domain input (remove http/https and trailing slash)
    let domainStr = newDomain.trim().toLowerCase();
    domainStr = domainStr.replace(/^(https?:\/\/)?(www\.)?/, '');
    domainStr = domainStr.split('/')[0];

    if (!domainStr) return;

    const setting: DomainSetting = {
      domain: domainStr,
      autoScanEnabled,
      ignored,
      createdAt: new Date().toISOString(),
    };

    await saveDomainSetting(setting);
    setNewDomain('');
    setAutoScanEnabled(true);
    setIgnored(false);
    await loadDomains();
  };

  const handleDelete = async (domain: string) => {
    await deleteDomainSetting(domain);
    await loadDomains();
  };

  const handleToggleAutoScan = async (domain: string, currentVal: boolean) => {
    const existing = domains.find(d => d.domain === domain);
    if (existing) {
      await saveDomainSetting({
        ...existing,
        autoScanEnabled: !currentVal,
      });
      await loadDomains();
    }
  };

  const handleToggleIgnored = async (domain: string, currentVal: boolean) => {
    const existing = domains.find(d => d.domain === domain);
    if (existing) {
      await saveDomainSetting({
        ...existing,
        ignored: !currentVal,
      });
      await loadDomains();
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading domains...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Add Custom Domain Rule</h3>
        <form onSubmit={handleAddDomain} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="domain-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Domain Name
            </label>
            <input
              id="domain-input"
              type="text"
              placeholder="e.g. amazon.com, sephora.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <Switch
              id="auto-scan-toggle"
              checked={autoScanEnabled}
              onChange={setAutoScanEnabled}
              label="Enable Auto-Scan"
            />
            <Switch
              id="ignore-toggle"
              checked={ignored}
              onChange={setIgnored}
              label="Ignore completely (don't watch)"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={!newDomain.trim()}>
              Add Domain Rule
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Domain Rules</h3>
        {domains.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No domain settings configured. All sites use default settings.</p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {domains.map((d) => (
              <div key={d.domain} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{d.domain}</h4>
                </div>
                <div className="flex items-center gap-6">
                  <Switch
                    id={`auto-scan-${d.domain}`}
                    checked={d.autoScanEnabled}
                    onChange={() => handleToggleAutoScan(d.domain, d.autoScanEnabled)}
                    label="Auto-Scan"
                  />
                  <Switch
                    id={`ignore-${d.domain}`}
                    checked={d.ignored}
                    onChange={() => handleToggleIgnored(d.domain, d.ignored)}
                    label="Ignore"
                  />
                  <Button variant="danger" size="sm" onClick={() => handleDelete(d.domain)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
