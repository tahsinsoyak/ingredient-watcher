import React from 'react';
import { useSettingsStore } from '@shared/store/useSettingsStore';
import Card from '@shared/components/Card';
import Switch from '@shared/components/Switch';

export function MatchingBehavior(): React.ReactElement {
  const settings = useSettingsStore();
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Matching Behavior Settings</h3>
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <Switch
              id="strictMode-toggle"
              checked={settings.strictMode}
              onChange={(val) => settings.updateSettings({ strictMode: val })}
              label="Strict Mode"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-11 -mt-2">
              If enabled, performs strict exact matches (avoiding partial matches/sub-words).
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Switch
              id="freeFrom-toggle"
              checked={settings.freeFromDetection}
              onChange={(val) => settings.updateSettings({ freeFromDetection: val })}
              label="Smart 'Free-From' / Negative Detection"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-11 -mt-2">
              Automatically detect context phrases like "gluten-free" or "lactose-free" and tag them as info (mentioned as absent) rather than warnings.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Switch
              id="accent-toggle"
              checked={settings.accentInsensitive}
              onChange={(val) => settings.updateSettings({ accentInsensitive: val })}
              label="Accent and Case Insensitivity"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-11 -mt-2">
              Ignore diacritics and letters normalization (e.g. match "laktoz" to "Laktóz").
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Switch
              id="overlay-toggle"
              checked={settings.showOverlayAlerts}
              onChange={(val) => settings.updateSettings({ showOverlayAlerts: val })}
              label="Show Overlay Alerts"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-11 -mt-2">
              Show a subtle top banner overlay on the page when ingredient watchlist matches are discovered.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
