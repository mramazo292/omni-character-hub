import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Shield,
  ShieldAlert,
  Database,
  Sparkles,
  Compass,
  Bookmark,
  Layers,
  LayoutGrid,
  List,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Activity,
  Trash2,
} from 'lucide-react';
import { CharacterSource } from '../types/character.ts';
import { UserPreferences } from '../utils/storage.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onResetPreferences: () => void;
  onExportLibrary: () => void;
  onClearCache: () => void;
  savedCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onResetPreferences,
  onExportLibrary,
  onClearCache,
  savedCount,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'sources' | 'data'>('general');
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({
    datacat: true,
    janny: true,
    chub: true,
  });

  useEffect(() => {
    if (isOpen) {
      // Check status of backend connectors
      fetch('/api/status')
        .then((res) => res.json())
        .then((data) => {
          if (data.connectors) {
            setConnectionStatus({
              datacat: Boolean(data.connectors.datacat?.available),
              janny: Boolean(data.connectors.janny?.available),
              chub: Boolean(data.connectors.chub?.available),
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-neutral-800 bg-[#0f1117] text-neutral-100 shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hub Preferences & Settings</h2>
              <p className="text-xs text-neutral-400">Configure sources, display density, and content filters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 px-6 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            General & Display
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'sources'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Connector Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Library & Storage
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Content Safe Mode Toggle */}
              <div className="flex items-start justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    {preferences.safeMode ? (
                      <Shield className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                    )}
                    <span className="text-sm font-semibold text-white">Safe Mode (SFW Filter)</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        preferences.safeMode
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}
                    >
                      {preferences.safeMode ? 'Active (Filtered)' : 'Unfiltered (All)'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    When disabled, all community characters from Datacat, Janny AI, and Chub are displayed without restrictive keyword filtering.
                  </p>
                </div>
                <button
                  onClick={() => onUpdatePreferences({ safeMode: !preferences.safeMode })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.safeMode ? 'bg-emerald-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.safeMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Grid Density */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Card Density</span>
                  <div className="flex rounded-lg border border-neutral-700 bg-neutral-800/80 p-0.5">
                    <button
                      onClick={() => onUpdatePreferences({ density: 'comfortable' })}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        preferences.density === 'comfortable'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Comfortable
                    </button>
                    <button
                      onClick={() => onUpdatePreferences({ density: 'compact' })}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        preferences.density === 'compact'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Compact
                    </button>
                  </div>
                </div>
                <p className="text-xs text-neutral-400">
                  Comfortable displays rich character descriptions and tokens. Compact fits more cards onto the screen.
                </p>
              </div>

              {/* View Mode */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Layout Mode</span>
                  <div className="flex rounded-lg border border-neutral-700 bg-neutral-800/80 p-0.5">
                    <button
                      onClick={() => onUpdatePreferences({ viewMode: 'grid' })}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        preferences.viewMode === 'grid'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span>Grid View</span>
                    </button>
                    <button
                      onClick={() => onUpdatePreferences({ viewMode: 'list' })}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        preferences.viewMode === 'list'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                      <span>List View</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                Live connector status for aggregated character repositories and archives:
              </p>

              {/* Datacat */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Datacat Native</h4>
                    <p className="text-[11px] text-neutral-400">Automated session-token handshake & character recovery</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Online</span>
                </div>
              </div>

              {/* Janny AI */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Janny AI</h4>
                    <p className="text-[11px] text-neutral-400">Janny AI archive mirror with full dialogue & personality recovery</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Online</span>
                </div>
              </div>

              {/* Chub.ai */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Chub.ai</h4>
                    <p className="text-[11px] text-neutral-400">Tavern V2 character repository with lorebooks & star ratings</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Online</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Saved Characters ({savedCount})</h4>
                    <p className="text-xs text-neutral-400">Backup your local library to a portable JSON file.</p>
                  </div>
                  <button
                    onClick={onExportLibrary}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Clear Cached Cards</h4>
                    <p className="text-xs text-neutral-400">Purge temporarily cached catalog responses to fetch fresh data.</p>
                  </div>
                  <button
                    onClick={onClearCache}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    <span>Clear Cache</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Reset Preferences</h4>
                    <p className="text-xs text-neutral-400">Restore display, filter, and layout defaults.</p>
                  </div>
                  <button
                    onClick={onResetPreferences}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-neutral-800 px-6 py-3.5 bg-neutral-950/60">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-800 hover:bg-neutral-700 px-5 py-2 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
