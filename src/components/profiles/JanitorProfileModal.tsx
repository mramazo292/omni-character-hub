import React, { useState } from 'react';
import {
  X,
  MessagesSquare,
  MessageSquare,
  ShieldCheck,
  ShieldX,
  Share2,
  Copy,
  Check,
  Download,
  Bookmark,
  Sparkles,
  Bot,
  User,
  Cpu,
  Layers,
} from 'lucide-react';
import { CharacterItem } from '../../types/character.ts';
import { exportCharacterAsJson } from '../../utils/cardParser.ts';

interface JanitorProfileModalProps {
  character: CharacterItem;
  onClose: () => void;
  onSaveToLibrary: (char: CharacterItem) => void;
  isSaved?: boolean;
}

export const JanitorProfileModal: React.FC<JanitorProfileModalProps> = ({
  character,
  onClose,
  onSaveToLibrary,
  isSaved = false,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'definition' | 'details'>('chat');

  const handleCopyPrompt = () => {
    const fullPrompt = `Name: ${character.name}\nDescription: ${character.description}\nPersonality: ${character.personality || ''}\nScenario: ${character.scenario || ''}\nFirst Message:\n${character.firstMessage || ''}`;
    navigator.clipboard.writeText(fullPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const formatNum = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  const meta = character.janitorMetadata;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-indigo-900/40 bg-[#0f111a] text-neutral-100 shadow-2xl ring-1 ring-white/10">
        {/* Janitor Header Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950">
          {character.avatarUrl && (
            <img
              src={character.avatarUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-30 scale-125"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Janitor Brand Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/80 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>JanitorAI Profile</span>
          </div>

          {/* Avatar & Title container */}
          <div className="absolute bottom-4 left-6 flex items-end gap-5">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-neutral-900 shadow-xl">
              {character.avatarUrl ? (
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-950 text-indigo-300">
                  <Bot className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="pb-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                {character.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                <span className="flex items-center gap-1 text-indigo-300">
                  <User className="h-3 w-3" />
                  @{character.creator}
                </span>
                <span>•</span>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-300 border border-indigo-500/20">
                  Verified Janitor Card
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Janitor Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-y border-neutral-800/80 bg-neutral-950/60 px-6 py-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <MessagesSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Chats</p>
              <p className="font-bold text-neutral-200">{formatNum(meta?.chatCount || 0)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Messages</p>
              <p className="font-bold text-neutral-200">{formatNum(meta?.messageCount || 0)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Tokens</p>
              <p className="font-bold text-neutral-200">{formatNum(character.totalTokens || 0)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${meta?.allowProxy !== false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {meta?.allowProxy !== false ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Allow Proxy</p>
              <p className="font-bold text-neutral-200">{meta?.allowProxy !== false ? 'Enabled' : 'Restricted'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-neutral-800 bg-[#0f111a] px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'chat'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            First Message & Chat Preview
          </button>
          <button
            onClick={() => setActiveTab('definition')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'definition'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Personality & Scenario
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Card Metadata & Tags
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Opening Message
                </h4>
                <div className="mt-2 relative rounded-2xl border border-indigo-950 bg-neutral-950/80 p-5 text-sm leading-relaxed text-neutral-200 shadow-inner">
                  {character.firstMessage ? (
                    <div className="whitespace-pre-wrap font-sans">
                      {character.firstMessage}
                    </div>
                  ) : (
                    <p className="italic text-neutral-500">No initial greeting provided.</p>
                  )}
                </div>
              </div>

              {/* Character Summary Box */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Character Overview
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-neutral-300 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
                  {character.description || 'No description available.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'definition' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Personality Definition
                </h4>
                <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-indigo-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {character.personality || character.description || 'Personality not specified.'}
                </div>
              </div>

              {character.scenario && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Scenario / World Lore
                  </h4>
                  <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {character.scenario}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Janitor Taxonomy Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {character.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-indigo-900/40 bg-indigo-950/30 px-2.5 py-1 text-xs font-medium text-indigo-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-900">
                  <span className="text-neutral-400">Original Janitor ID</span>
                  <span className="font-mono text-neutral-300">{character.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-900">
                  <span className="text-neutral-400">Permanent Token Weight</span>
                  <span className="font-mono text-neutral-300">{meta?.permanentTokens || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-900">
                  <span className="text-neutral-400">Source Provenance</span>
                  <span className="text-indigo-400 font-semibold">JanitorAI Upstream</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 bg-neutral-950/90 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              {copiedPrompt ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedPrompt ? 'Copied System Prompt' : 'Copy Prompt'}</span>
            </button>

            <button
              onClick={() => exportCharacterAsJson(character)}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Card JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveToLibrary(character)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
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
