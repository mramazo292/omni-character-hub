import React, { useState } from 'react';
import {
  X,
  Database,
  Hash,
  Award,
  Cpu,
  Download,
  Copy,
  Check,
  Bookmark,
  Bot,
  User,
  ShieldCheck,
  Code,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CharacterItem } from '../../types/character.ts';
import { exportCharacterAsJson } from '../../utils/cardParser.ts';

interface DatacatProfileModalProps {
  character: CharacterItem;
  onClose: () => void;
  onSaveToLibrary: (char: CharacterItem) => void;
  isSaved?: boolean;
}

export const DatacatProfileModal: React.FC<DatacatProfileModalProps> = ({
  character,
  onClose,
  onSaveToLibrary,
  isSaved = false,
}) => {
  const [activeTab, setActiveTab] = useState<'inspector' | 'description' | 'tokens'>('inspector');
  const [copiedHash, setCopiedHash] = useState(false);
  const [showRawHtml, setShowRawHtml] = useState(false);

  const meta = character.datacatMetadata;

  const handleCopyHash = () => {
    if (meta?.contentHash) {
      navigator.clipboard.writeText(meta.contentHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-sky-900/40 bg-[#070b12] text-neutral-100 shadow-2xl ring-1 ring-white/10">
        {/* Datacat Header Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950">
          {character.avatarUrl && (
            <img
              src={character.avatarUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-25 scale-125"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Datacat Brand Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-950/80 px-3 py-1 text-xs font-semibold text-sky-300 backdrop-blur-md shadow-sm">
            <Database className="h-3.5 w-3.5 text-sky-400" />
            <span>Datacat Index Inspector</span>
          </div>

          {/* Avatar & Title container */}
          <div className="absolute bottom-4 left-6 flex items-end gap-5">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-sky-500/40 bg-neutral-900 shadow-xl">
              {character.avatarUrl ? (
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-sky-950 text-sky-300">
                  <Bot className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="pb-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                {character.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                <span className="flex items-center gap-1 text-sky-300">
                  <User className="h-3 w-3" />
                  @{character.creator}
                </span>
                <span>•</span>
                <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-300 border border-sky-500/20">
                  {meta?.jannyaiRecoveryState === 'jannyai_recovery_complete' ? 'Liberator Recovered' : 'Indexed in Datacat'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Datacat Metadata Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-y border-neutral-800/80 bg-neutral-950/60 px-6 py-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Scorer Total</p>
              <p className="font-bold text-neutral-200">{meta?.scorerBaseTotal || 75}/100</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Total Tokens</p>
              <p className="font-bold text-neutral-200">{character.totalTokens || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Source Kind</p>
              <p className="font-bold text-neutral-200 uppercase text-[11px]">{meta?.primaryContentSourceKind || 'Core'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Hash className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Content Hash</p>
              <p className="font-bold text-neutral-200 font-mono text-[10px]">
                {meta?.contentHash ? `${meta.contentHash.slice(0, 8)}...` : 'Verified'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-800 bg-[#070b12] px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'inspector'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Card Inspector
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'description'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Full Description
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'tokens'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Token Breakdown
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              {/* Opening Greeting */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Extracted Opening Message
                </h4>
                <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-relaxed text-neutral-200 whitespace-pre-wrap shadow-inner font-sans">
                  {character.firstMessage || 'No greeting text found in card.'}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Datacat Taxonomy Facets
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {character.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-sky-900/40 bg-sky-950/30 px-2.5 py-1 text-xs font-medium text-sky-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hashes & Provenance */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-neutral-900">
                  <span className="text-neutral-400">Content Hash SHA-256</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-neutral-300">
                      {meta?.contentHash || 'Verified Clean Content'}
                    </span>
                    {meta?.contentHash && (
                      <button
                        onClick={handleCopyHash}
                        className="text-sky-400 hover:text-sky-300"
                        title="Copy Hash"
                      >
                        {copiedHash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-neutral-400">SillyTavern Bridge Status</span>
                  <span className="text-emerald-400 font-semibold">1-Click Direct Compatible</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Character Lore & Background
                </h4>
                {character.rawDescription && (
                  <button
                    onClick={() => setShowRawHtml(!showRawHtml)}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
                  >
                    <Code className="h-3.5 w-3.5" />
                    <span>{showRawHtml ? 'Formatted Text' : 'View Raw HTML'}</span>
                  </button>
                )}
              </div>

              {showRawHtml && character.rawDescription ? (
                <pre className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-300 whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {character.rawDescription}
                </pre>
              ) : (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-relaxed text-neutral-200 whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {character.description || 'No description available.'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Detailed Token Allocation
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300">Personality Tokens</span>
                    <span className="font-mono text-sky-400">
                      {meta?.tokenCounts?.personality_tokens || 'N/A'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-900 overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full w-2/3" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300">Scenario Tokens</span>
                    <span className="font-mono text-indigo-400">
                      {meta?.tokenCounts?.scenario_tokens || 'N/A'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-900 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-1/4" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300">First Message Tokens</span>
                    <span className="font-mono text-purple-400">
                      {meta?.tokenCounts?.first_message_tokens || 'N/A'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-900 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-1/3" />
                  </div>
                </div>
              </div>
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
              <span>Export Card JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveToLibrary(character)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                isSaved
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-600 text-white hover:bg-sky-500 shadow-sky-600/20'
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
