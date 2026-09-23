import React from 'react';
import {
  Compass,
  Database,
  Layers,
  Sparkles,
  BookmarkCheck,
  UploadCloud,
  LayoutGrid,
  Columns,
  Settings,
  PanelLeft,
} from 'lucide-react';
import { CharacterSource } from '../types/character.ts';
import { UserPreferences } from '../utils/storage.ts';
import { RoseIcon } from './LumiverseDrawer.tsx';

interface NavbarProps {
  activeSource: CharacterSource;
  onSelectSource: (source: CharacterSource) => void;
  libraryCount: number;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onOpenLumiverse: () => void;
  onToggleSidebar: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSource,
  onSelectSource,
  libraryCount,
  onOpenImport,
  onOpenSettings,
  onOpenLumiverse,
  onToggleSidebar,
  preferences,
  onUpdatePreferences,
}) => {
  const isJanny = activeSource === 'janny' || activeSource === 'janitor';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl transition-all">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        {/* Left: Sidebar Toggle & Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Toggle Sidebar Navigation"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  Omni Character Hub
                </span>
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-rose-400 ring-1 ring-rose-500/30">
                  Lumiverse Extension
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Chub.ai • Janny AI • Datacat Unified Engine
              </p>
            </div>
          </div>
        </div>

        {/* Center: Source Selector Tabs */}
        <nav className="hidden md:flex items-center rounded-xl bg-neutral-900/90 p-1 ring-1 ring-neutral-800 shadow-inner">
          <button
            onClick={() => onSelectSource('chub')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeSource === 'chub'
                ? 'bg-[#e11d48] text-white shadow-sm ring-1 ring-rose-500/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Chub.ai</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => onSelectSource('janny')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              isJanny
                ? 'bg-[#e11d48] text-white shadow-sm ring-1 ring-rose-500/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Janny AI</span>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          </button>

          <button
            onClick={() => onSelectSource('datacat')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeSource === 'datacat'
                ? 'bg-[#e11d48] text-white shadow-sm ring-1 ring-rose-500/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-sky-400" />
            <span>Datacat</span>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
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

        {/* Right: Actions, NSFW Toggle, PINNED ROSE BUTTON & Settings */}
        <div className="flex items-center gap-2">
          {/* Explicit NSFW Setting Toggle (Toggled ON by default) */}
          <button
            onClick={() => onUpdatePreferences({ nsfw: !preferences.nsfw })}
            title={preferences.nsfw ? 'NSFW Enabled (All Characters)' : 'NSFW Disabled (SFW Filtered)'}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ring-1 ${
              preferences.nsfw
                ? 'bg-rose-500/20 text-rose-300 ring-rose-500/40 hover:bg-rose-500/30'
                : 'bg-neutral-900 text-neutral-400 ring-neutral-800 hover:text-neutral-200'
            }`}
          >
            <span className={preferences.nsfw ? 'text-rose-400' : 'text-neutral-500'}>🔞</span>
            <span className="text-xs">NSFW</span>
            <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${preferences.nsfw ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
              {preferences.nsfw ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Density Switch */}
          <div className="hidden sm:flex rounded-lg bg-neutral-900 p-0.5 ring-1 ring-neutral-800">
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

          {/* PINNED ROSE BUTTON (Right next to the Settings gear) */}
          <button
            id="omni-topbar-rose-btn"
            onClick={onOpenLumiverse}
            title="Open Character Hub in Lumiverse Drawer"
            className="omni-topbar-pinned flex h-9 items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-2.5 text-rose-300 hover:bg-rose-900/50 hover:border-rose-500/60 transition-all shadow-sm shadow-rose-900/20 active:scale-95"
          >
            <RoseIcon size={18} />
            <span className="hidden md:inline text-xs font-bold text-rose-200">Lumiverse</span>
          </button>

          {/* Settings Button (Right next to the Rose button) */}
          <button
            onClick={onOpenSettings}
            title="Hub Settings & Preferences"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Import Button */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95"
          >
            <UploadCloud className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
        </div>
      </div>

      {/* Mobile Source Selector Tabs */}
      <div className="flex md:hidden border-t border-neutral-900 bg-neutral-950 px-4 py-2 overflow-x-auto gap-2">
        <button
          onClick={() => onSelectSource('chub')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium ${
            activeSource === 'chub'
              ? 'bg-[#e11d48] text-white font-semibold'
              : 'text-neutral-400'
          }`}
        >
          <Compass className="h-3 w-3" />
          <span>Chub.ai</span>
        </button>
        <button
          onClick={() => onSelectSource('janny')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium ${
            isJanny
              ? 'bg-[#e11d48] text-white font-semibold'
              : 'text-neutral-400'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>Janny AI</span>
        </button>
        <button
          onClick={() => onSelectSource('datacat')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium ${
            activeSource === 'datacat'
              ? 'bg-[#e11d48] text-white font-semibold'
              : 'text-neutral-400'
          }`}
        >
          <Database className="h-3 w-3" />
          <span>Datacat</span>
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
