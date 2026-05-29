import React, { useEffect, useState } from 'react';
import { useWatchlistStore } from '@shared/store/useWatchlistStore';
import { useSettingsStore } from '@shared/store/useSettingsStore';
import { strings } from '@shared/lib/i18n';
import {
  LeafIcon,
  ClipboardIcon,
  PackageIcon,
  GlobeIcon,
  TargetIcon,
  BanIcon,
  LockIcon,
  PaletteIcon,
  CloseIcon,
  MenuIcon,
} from '@shared/components/Icons';
import { WatchlistEditor } from './components/WatchlistEditor';
import { PresetPacks } from './components/PresetPacks';
import { DomainSettings } from './components/DomainSettings';
import { MatchingBehavior } from './components/MatchingBehavior';
import { FalsePositiveRules } from './components/FalsePositiveRules';
import { DataControls } from './components/DataControls';
import { PrivacyInfo } from './components/PrivacyInfo';
import { AppearanceSettings } from './components/AppearanceSettings';

type SectionId =
  | 'watchlist'
  | 'presets'
  | 'domains'
  | 'matching'
  | 'false-positives'
  | 'privacy'
  | 'appearance';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'watchlist', label: strings.options.watchlist, icon: <ClipboardIcon className="w-4 h-4" /> },
  { id: 'presets', label: strings.options.presetPacks, icon: <PackageIcon className="w-4 h-4" /> },
  { id: 'domains', label: strings.options.domainSettings, icon: <GlobeIcon className="w-4 h-4" /> },
  { id: 'matching', label: strings.options.matching, icon: <TargetIcon className="w-4 h-4" /> },
  { id: 'false-positives', label: strings.options.falsePositives, icon: <BanIcon className="w-4 h-4" /> },
  { id: 'privacy', label: strings.options.privacyData, icon: <LockIcon className="w-4 h-4" /> },
  { id: 'appearance', label: strings.options.appearance, icon: <PaletteIcon className="w-4 h-4" /> },
];

function renderSection(section: SectionId): React.ReactNode {
  switch (section) {
    case 'watchlist':
      return <WatchlistEditor />;
    case 'presets':
      return <PresetPacks />;
    case 'domains':
      return <DomainSettings />;
    case 'matching':
      return <MatchingBehavior />;
    case 'false-positives':
      return <FalsePositiveRules />;
    case 'privacy':
      return (
        <>
          <PrivacyInfo />
          <div className="mt-8">
            <DataControls />
          </div>
        </>
      );
    case 'appearance':
      return <AppearanceSettings />;
    default:
      return null;
  }
}

export function OptionsApp(): React.ReactElement {
  const [activeSection, setActiveSection] = useState<SectionId>('watchlist');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loadTerms = useWatchlistStore((s) => s.loadTerms);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    void loadTerms();
    void loadSettings();
  }, [loadTerms, loadSettings]);

  const handleNavClick = (id: SectionId) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-page-light dark:bg-page-dark font-sans">
      {/* ── Sidebar (Desktop) ────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-700/60
          bg-surface-light dark:bg-surface-dark shrink-0"
        role="navigation"
        aria-label="Settings navigation"
      >
        {/* Branding */}
        <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700
                flex items-center justify-center shadow-md"
            >
              <LeafIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {strings.app.name}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Settings</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                  text-sm font-medium transition-all duration-150 group
                  ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-all duration-150`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
              font-semibold bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              {strings.privacy.badge}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header ────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-surface-light dark:bg-surface-dark
        border-b border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700
                flex items-center justify-center"
            >
              <LeafIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Settings</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <CloseIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <nav
            className="px-3 pb-3 space-y-0.5 animate-slide-down"
            role="navigation"
            aria-label="Settings navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span aria-hidden="true">{item.icon}</span>                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main
        className="flex-1 lg:pt-0 pt-14 overflow-y-auto"
        role="main"
        aria-label={`${NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? ''} settings`}
      >
        <div className="max-w-4xl mx-auto px-6 py-8 lg:px-10 lg:py-10">
          {/* Section header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span aria-hidden="true" className="text-brand-600 dark:text-brand-400">
                {NAV_ITEMS.find((n) => n.id === activeSection)?.icon}
              </span>
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
            </h2>
          </div>

          {/* Section content */}
          <div className="animate-fade-in">
            {renderSection(activeSection)}
          </div>
        </div>
      </main>
    </div>
  );
}
