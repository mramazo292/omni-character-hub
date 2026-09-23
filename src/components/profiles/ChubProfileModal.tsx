import React, { useState } from 'react';
import {
  X,
  Compass,
  Star,
  Download,
  GitFork,
  BookOpen,
  Code2,
  FileText,
  Copy,
  Check,
  Bookmark,
  User,
  Bot,
  Layers,
} from 'lucide-react';
import { CharacterItem } from '../../types/character.ts';
import { exportCharacterAsJson } from '../../utils/cardParser.ts';

interface ChubProfileModalProps {
  character: CharacterItem;
  onClose: () => void;
  onSaveToLibrary: (char: CharacterItem) => void;
  isSaved?: boolean;
}

export const ChubProfileModal: React.FC<ChubProfileModalProps> = ({
  character,
  onClose,
  onSaveToLibrary,
  isSaved = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'definition' | 'firstMessage' | 'raw'>('overview');
  const [copiedRaw, setCopiedRaw] = useState(false);

  const meta = character.chubMetadata;

  const handleCopyRaw = () => {
    const data = character.rawCardData || {
      name: character.name,
      description: character.description,
      personality: character.personality,
      scenario: character.scenario,
      first_mes: character.firstMessage,
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const formatNum = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-emerald-900/40 bg-[#0a1118] text-neutral-100 shadow-2xl ring-1 ring-white/10">
        {/* Chub Header Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950">
          {character.avatarUrl && (
            <img
              src={character.avatarUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-25 scale-125"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1118] via-[#0a1118]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Chub Brand Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-sm">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Chub.ai Repository Hub</span>
          </div>

          {/* Avatar & Title container */}
          <div className="absolute bottom-4 left-6 flex items-end gap-5">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-neutral-900 shadow-xl">
              {character.avatarUrl ? (
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-emerald-950 text-emerald-300">
                  <Bot className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                  {character.name}
                </h2>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 uppercase">
                  {meta?.specVersion || 'V2'} Card
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                <span className="flex items-center gap-1 text-emerald-300">
                  <User className="h-3 w-3" />
                  @{character.creator}
                </span>
                <span>•</span>
                <span>Tavern AI Compatible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chub Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-y border-neutral-800/80 bg-neutral-950/60 px-6 py-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Stars</p>
              <p className="font-bold text-neutral-200">{formatNum(meta?.starCount || 0)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Downloads</p>
              <p className="font-bold text-neutral-200">{formatNum(meta?.downloadCount || 0)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <GitFork className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Forks</p>
              <p className="font-bold text-neutral-200">{meta?.forkCount || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Lorebook</p>
              <p className="font-bold text-neutral-200">{meta?.hasLorebook ? 'Included' : 'None'}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-800 bg-[#0a1118] px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('definition')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'definition'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Character Definition
          </button>
          <button
            onClick={() => setActiveTab('firstMessage')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'firstMessage'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            First Message
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'raw'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Raw Spec JSON
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Tagline & Description
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-neutral-200 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
                  {character.description}
                </p>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Topics & Categories
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {character.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-2.5 py-1 text-xs font-medium text-emerald-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {meta?.hasLorebook && (
                <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <BookOpen className="h-4 w-4" />
                    <span>Embedded World Lorebook</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-300">
                    {meta.lorebookName || 'Character-specific background lorebook included in export.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'definition' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Personality Prompt
                </h4>
                <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-emerald-200 whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {character.personality || character.description}
                </div>
              </div>

              {character.scenario && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Scenario / Setting
                  </h4>
                  <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {character.scenario}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'firstMessage' && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                First Greeting (first_mes)
              </h4>
              <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-sm leading-relaxed text-neutral-200 whitespace-pre-wrap shadow-inner font-sans">
                {character.firstMessage || 'No greeting specified.'}
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Tavern V2 Specification JSON
                </h4>
                <button
                  onClick={handleCopyRaw}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {copiedRaw ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedRaw ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-[11px] leading-relaxed text-neutral-300 max-h-80 overflow-y-auto">
                {JSON.stringify(character.rawCardData || character, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 bg-neutral-950/90 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCharacterAsJson(character)}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Tavern Card</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveToLibrary(character)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved in Library' : 'Add to My Library'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
