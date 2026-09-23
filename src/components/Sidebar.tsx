import React from 'react';
import {
  Database,
  Sparkles,
  Compass,
  Bookmark,
  Upload,
  Settings,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { CharacterSource } from '../types/character.ts';
import { RoseIcon } from './LumiverseDrawer.tsx';

interface SidebarProps {
  activeSource: CharacterSource;
  onSelectSource: (source: CharacterSource) => void;
  savedCount: number;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onOpenLumiverse: () => void;
  onEnterHub: () => void;
  nsfw: boolean;
  onToggleNsfw: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSource,
  onSelectSource,
  savedCount,
  onOpenImport,
  onOpenSettings,
  onOpenLumiverse,
  onEnterHub,
  nsfw,
  onToggleNsfw,
  isCollapsed,
  onToggleCollapse,
}) => {
  const isJanny = activeSource === 'janny' || activeSource === 'janitor';

  return (
    <aside
      className={`relative flex flex-col border-r border-neutral-800/80 bg-[#0d1017] transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top App Branding */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-800/80 px-4">
        <div
          onClick={onEnterHub}
          className="flex items-center gap-3 cursor-pointer group"
          title="Enter Omni Character Hub"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-indigo-600 text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <RoseIcon size={22} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
                Omni Hub
                <span className="rounded bg-rose-500/20 text-rose-300 text-[10px] px-1 py-0.2 font-mono">Spindle</span>
              </span>
              <span className="text-[11px] text-neutral-400 truncate">Lumiverse Extension</span>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Navigation Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Aggregated Sources
            </div>
          )}
          <nav className="space-y-1">
            {/* Chub.ai */}
            <button
              onClick={() => onSelectSource('chub')}
              title="Chub.ai Repository"
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                activeSource === 'chub'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200 border border-transparent'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                  activeSource === 'chub'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-neutral-800/80 text-neutral-400'
                }`}
              >
                <Compass className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between text-left">
                  <span>Chub.ai</span>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-400 font-mono">
                    Tavern V2
                  </span>
                </div>
              )}
            </button>

            {/* Janny AI (NOT JanitorAI) */}
            <button
              onClick={() => onSelectSource('janny')}
              title="Janny AI Archive"
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isJanny
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200 border border-transparent'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                  isJanny
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-neutral-800/80 text-neutral-400'
                }`}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between text-left">
                  <span>Janny AI</span>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-400 font-mono">
                    Active
                  </span>
                </div>
              )}
            </button>

            {/* Datacat */}
            <button
              onClick={() => onSelectSource('datacat')}
              title="Datacat Native Index"
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                activeSource === 'datacat'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200 border border-transparent'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                  activeSource === 'datacat'
                    ? 'bg-sky-500/20 text-sky-400'
                    : 'bg-neutral-800/80 text-neutral-400'
                }`}
              >
                <Database className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between text-left">
                  <span>Datacat</span>
                  <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] text-sky-400 font-mono">
                    Live
                  </span>
                </div>
              )}
            </button>
          </nav>
        </div>

        {/* Personal Space & Tools */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Personal Space
            </div>
          )}
          <nav className="space-y-1">
            {/* My Library */}
            <button
              onClick={() => onSelectSource('local')}
              title="My Saved Library"
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                activeSource === 'local'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200 border border-transparent'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                  activeSource === 'local'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-neutral-800/80 text-neutral-400'
                }`}
              >
                <Bookmark className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between text-left">
                  <span>My Library</span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    {savedCount}
                  </span>
                </div>
              )}
            </button>

            {/* Import Card */}
            <button
              onClick={onOpenImport}
              title="Import Character Card (PNG / JSON)"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200 border border-transparent transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800/80 text-neutral-400 flex-shrink-0">
                <Upload className="h-4 w-4" />
              </div>
              {!isCollapsed && <span className="text-left">Import Card</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Section: NSFW Setting Toggle, Lumiverse Button, Enter Hub & Settings */}
      <div className="border-t border-neutral-800/80 p-3 space-y-2 bg-[#090b10]">
        {/* Explicit NSFW Setting Toggle (Toggled ON by default) */}
        <button
          onClick={onToggleNsfw}
          title={nsfw ? 'NSFW Enabled (All Characters)' : 'NSFW Disabled (SFW Filtered)'}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold border transition-all ${
            nsfw
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              : 'border-neutral-800 bg-neutral-900/60 text-neutral-400'
          }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0">
            <span>🔞</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-1 items-center justify-between">
              <span>NSFW Filter</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${nsfw ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                {nsfw ? 'ON' : 'OFF'}
              </span>
            </div>
          )}
        </button>

        {/* LUMIVERSE ROSE BUTTON (Pinned right near Settings) */}
        <button
          id="omni-sidebar-rose-btn"
          onClick={onOpenLumiverse}
          title="Open Character Hub in Lumiverse Drawer Preset"
          className="group relative flex w-full items-center gap-3 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/70 to-neutral-900 px-3 py-2.5 text-xs font-bold text-rose-200 shadow-md shadow-rose-950/40 hover:border-rose-500/80 hover:bg-rose-900/40 transition-all active:scale-[0.98]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-white flex-shrink-0 group-hover:scale-110 transition-transform">
            <RoseIcon size={20} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left overflow-hidden">
              <span className="leading-tight text-white flex items-center gap-1">
                Open in Lumiverse
              </span>
              <span className="text-[10px] font-normal text-rose-300 opacity-90 truncate">
                Drawer Preset UI
              </span>
            </div>
          )}
        </button>

        {/* ENTER HUB BUTTON */}
        <button
          onClick={onEnterHub}
          title="Enter Omni Character Hub"
          className="group relative flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white flex-shrink-0 backdrop-blur-sm group-hover:scale-105 transition-transform">
            <LogIn className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left overflow-hidden">
              <span className="leading-tight">Enter Hub</span>
              <span className="text-[10px] font-normal text-indigo-100 opacity-90 truncate">
                Launch Explorer
              </span>
            </div>
          )}
        </button>

        {/* SETTINGS BUTTON (Right near Enter Hub & Lumiverse Rose) */}
        <button
          onClick={onOpenSettings}
          title="Hub Settings & Preferences"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-400 hover:bg-neutral-800 hover:text-white border border-transparent transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800/80 text-neutral-400 flex-shrink-0">
            <Settings className="h-4 w-4" />
          </div>
          {!isCollapsed && <span className="text-left">Settings</span>}
        </button>
      </div>
    </aside>
  );
};
