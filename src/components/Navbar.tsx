import React from 'react';
import {
  Compass,
  Database,
  Layers,
  Sparkles,
  BookmarkCheck,
  UploadCloud,
  Shield,
  ShieldAlert,
  LayoutGrid,
  Columns,
} from 'lucide-react';
import { CharacterSource } from '../types/character.ts';
import { UserPreferences } from '../utils/storage.ts';

interface NavbarProps {
  activeSource: CharacterSource;
  onSelectSource: (source: CharacterSource) => void;
  libraryCount: number;
  onOpenImport: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSource,
  onSelectSource,
  libraryCount,
  onOpenImport,
  preferences,
  onUpdatePreferences,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Branding & Core Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                Omni Character Hub
              </span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-400 ring-1 ring-indigo-500/30">
                v2.0 Rebuild
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Universal Multi-Source Card Explorer
            </p>
          </div>
        </div>

        {/* Center: Source Selector Tabs */}
        <nav className="hidden md:flex items-center rounded-xl bg-neutral-900/90 p-1 ring-1 ring-neutral-800 shadow-inner">
          <button
            onClick={() => onSelectSource('datacat')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeSource === 'datacat'
                ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700/80'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-sky-400" />
            <span>Datacat</span>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
          </button>

          <button
            onClick={() => onSelectSource('janitor')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeSource === 'janitor'
                ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700/80'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>JanitorAI</span>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          </button>

          <button
            onClick={() => onSelectSource('chub')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeSource === 'chub'
                ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700/80'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Chub.ai</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <div className="mx-1 h-4 w-px bg-neutral-800" />

          <button
            onClick={() => onSelectSource('local')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeSource === 'local'
                ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700/80'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>My Library</span>
            {libraryCount > 0 && (
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
                {libraryCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Actions & Preferences */}
        <div className="flex items-center gap-2">
          {/* Safe Mode Toggle */}
          <button
            onClick={() =>
              onUpdatePreferences({ safeMode: !preferences.safeMode })
            }
            title={preferences.safeMode ? 'Safe Mode Active (SFW Only)' : 'Explicit Mode (Unfiltered)'}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ring-1 ${
              preferences.safeMode
                ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 ring-rose-500/20 hover:bg-rose-500/20'
            }`}
          >
            {preferences.safeMode ? (
              <Shield className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {preferences.safeMode ? 'SFW Safe' : 'Unfiltered'}
            </span>
          </button>

          {/* Density Switch */}
          <div className="flex rounded-lg bg-neutral-900 p-0.5 ring-1 ring-neutral-800">
            <button
              onClick={() => onUpdatePreferences({ density: 'comfortable' })}
              title="Comfortable Grid"
              className={`rounded-md p-1.5 transition-colors ${
                preferences.density === 'comfortable'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onUpdatePreferences({ density: 'compact' })}
              title="Compact Grid"
              className={`rounded-md p-1.5 transition-colors ${
                preferences.density === 'compact'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Import Button */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95"
          >
            <UploadCloud className="h-4 w-4" />
            <span className="hidden sm:inline">Import Card</span>
          </button>
        </div>
      </div>

      {/* Mobile Source Selector Tabs */}
      <div className="flex md:hidden border-t border-neutral-900 bg-neutral-950 px-4 py-2 overflow-x-auto gap-2">
        <button
          onClick={() => onSelectSource('datacat')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium ${
            activeSource === 'datacat'
              ? 'bg-neutral-800 text-sky-400'
              : 'text-neutral-400'
          }`}
        >
          <Database className="h-3 w-3" />
          <span>Datacat</span>
        </button>
        <button
          onClick={() => onSelectSource('janitor')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium ${
            activeSource === 'janitor'
              ? 'bg-neutral-800 text-indigo-400'
              : 'text-neutral-400'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>JanitorAI</span>
        </button>
        <button
          onClick={() => onSelectSource('chub')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium ${
            activeSource === 'chub'
              ? 'bg-neutral-800 text-emerald-400'
              : 'text-neutral-400'
          }`}
        >
          <Compass className="h-3 w-3" />
          <span>Chub.ai</span>
        </button>
        <button
          onClick={() => onSelectSource('local')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium ${
            activeSource === 'local'
              ? 'bg-neutral-800 text-amber-400'
              : 'text-neutral-400'
          }`}
        >
          <BookmarkCheck className="h-3 w-3" />
          <span>Library ({libraryCount})</span>
        </button>
      </div>
    </header>
  );
};
