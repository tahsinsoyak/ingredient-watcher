import React from 'react';
import Card from '@shared/components/Card';
import Badge from '@shared/components/Badge';

export function PrivacyInfo(): React.ReactElement {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Privacy-First Architecture</h3>
          <Badge variant="privacy" label="Local-Only Storage" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Ingredient Watchlist operates 100% locally in your web browser. We never track, transmit, collect, or share your browsing history, searches, custom watchlist ingredients, or domain settings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <span>✓</span> What We Store (Locally Only)
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Your custom watchlist term text and labels</li>
              <li>Enabled/disabled preset pack IDs</li>
              <li>Site-specific scan settings (e.g. autoscanning)</li>
              <li>Specific matches you choose to ignore/bypass</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-red-500 dark:text-red-400 flex items-center gap-2">
              <span>✕</span> What We NEVER Store or Transmit
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
              <li>Websites you visit or links you click</li>
              <li>Product details or pages you scan</li>
              <li>Any personally identifiable information (PII)</li>
              <li>External server telemetry or tracker cookies</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Permissions Breakdown</h3>
        <div className="space-y-4">
          <div>
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">storage</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Required to save your personalized watchlist, configurations, and domain rules on your computer.
            </p>
          </div>
          <div>
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">activeTab / scripting</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Used strictly to read ingredient text blocks on the page you explicitly view, highlighting matching terms. Analysis is done live inside your browser sandbox.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
