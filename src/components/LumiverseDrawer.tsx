import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Tag,
  ArrowLeft,
  Download,
  ExternalLink,
  Check,
  Sparkles,
  Bot,
  SlidersHorizontal,
} from 'lucide-react';
import { CharacterItem, CharacterSource } from '../types/character.ts';

export const ROSE_SVG_RAW = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
  <path d="M12 2C9.5 2 7 3.5 7 6.5C7 9.5 10 11.5 12 13C14 11.5 17 9.5 17 6.5C17 3.5 14.5 2 12 2Z" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
  <path d="M10 5C11 4 13 4 14 5C15 6.5 14.5 8 13.5 9C12.5 10 11.5 10 10.5 9C9.5 8 9 6.5 10 5Z" fill="#be123c"/>
  <path d="M12 13V22" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
  <path d="M12 17C10 15 7 16 6 18C7.5 18.5 9.5 18 12 17Z" fill="#059669"/>
  <path d="M12 15C14 13.5 17 14 18 16C16.5 16.5 14.5 16 12 15Z" fill="#059669"/>
</svg>
`;

export const RoseIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    className={className}
  >
    <path
      d="M12 2C9.5 2 7 3.5 7 6.5C7 9.5 10 11.5 12 13C14 11.5 17 9.5 17 6.5C17 3.5 14.5 2 12 2Z"
      fill="#f43f5e"
      stroke="#e11d48"
      strokeWidth="1.5"
    />
    <path
      d="M10 5C11 4 13 4 14 5C15 6.5 14.5 8 13.5 9C12.5 10 11.5 10 10.5 9C9.5 8 9 6.5 10 5Z"
      fill="#be123c"
    />
    <path d="M12 13V22" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 17C10 15 7 16 6 18C7.5 18.5 9.5 18 12 17Z" fill="#059669" />
    <path d="M12 15C14 13.5 17 14 18 16C16.5 16.5 14.5 16 12 15Z" fill="#059669" />
  </svg>
);

const LUMIVERSE_PLATFORMS = {
  chub: {
    name: 'Chub.ai',
    sorts: [
      { id: 'download_count', name: '🔥 Most Popular' },
      { id: 'star_count', name: '⭐ Top Rated' },
      { id: 'last_activity_at', name: '✨ Recently Active' },
      { id: 'created_at', name: '📅 Newly Added' },
    ],
    tags: [
      'Anime',
      'RPG',
      'Female',
      'Male',
      'Romance',
      'Fantasy',
      'Dominant',
      'Submissive',
      'Yandere',
      'Monster Girl',
      'Sci-Fi',
      'Horror',
      'Smut',
      'Slice of Life',
      'Comedy',
      'Mystery',
      'Superhero',
      'Villain',
    ],
  },
  janny: {
    name: 'Janny AI',
    sorts: [
      { id: 'trending', name: '🔥 Trending Now' },
      { id: 'popular', name: '👑 All-Time Popular' },
      { id: 'recent', name: '✨ Newly Added' },
    ],
    tags: [
      'AnyPOV',
      'MalePOV',
      'FemPOV',
      'Enemies to Lovers',
      'Dead Dove',
      'Slow Burn',
      'Angst',
      'Fluff',
      'Smut',
      'Monster',
      'Royalty',
      'Mafia',
      'Supernatural',
      'College',
      'Vampire',
      'Step-sibling',
    ],
  },
  datacat: {
    name: 'Datacat',
    sorts: [
      { id: 'recent', name: '🌱 Fresh Catalog' },
      { id: 'popular', name: '🔥 Top Kudos' },
    ],
    tags: ['Janitor', 'Saucepan', 'OC', 'RPG', 'NSFW', 'Fluff', 'Angst', 'Romance', 'Fantasy', 'Modern', 'Sci-Fi'],
  },
};

interface LumiverseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToLibrary: (char: CharacterItem) => void;
  nsfw: boolean;
  onToggleNsfw: (val: boolean) => void;
}

export const LumiverseDrawer: React.FC<LumiverseDrawerProps> = ({
  isOpen,
  onClose,
  onSaveToLibrary,
  nsfw,
  onToggleNsfw,
}) => {
  const [currentSource, setCurrentSource] = useState<'chub' | 'janny' | 'datacat'>('chub');
  const [currentSort, setCurrentSort] = useState('download_count');
  const [selectedTag, setSelectedTag] = useState('');
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [characters, setCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagFilterInput, setTagFilterInput] = useState('');

  // Inspector State
  const [activeChar, setActiveChar] = useState<any | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'greetings' | 'definition' | 'summary' | 'stats'>('greetings');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Sync sort when source changes
  useEffect(() => {
    const defaultSort = LUMIVERSE_PLATFORMS[currentSource].sorts[0].id;
    setCurrentSort(defaultSort);
    setSelectedTag('');
    setCurrentPage(1);
  }, [currentSource]);

  // Load catalog
  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      let url = '';
      if (currentSource === 'chub') {
        const params = new URLSearchParams({
          search: query,
          sort: currentSort,
          offset: String((currentPage - 1) * 24),
          limit: '24',
          nsfw: nsfw ? 'true' : 'false',
        });
        if (selectedTag) params.append('tag', selectedTag);
        url = `/api/chub/characters?${params}`;
      } else if (currentSource === 'janny') {
        const params = new URLSearchParams({
          search: query,
          sort: currentSort,
          offset: String((currentPage - 1) * 24),
          limit: '24',
          nsfw: nsfw ? 'true' : 'false',
        });
        if (selectedTag) params.append('tagId', selectedTag);
        url = `/api/janny/characters?${params}`;
      } else {
        const params = new URLSearchParams({
          search: query,
          sort: currentSort,
          offset: String((currentPage - 1) * 24),
          limit: '24',
          nsfw: nsfw ? 'true' : 'false',
        });
        if (selectedTag) params.append('tagIds', selectedTag);
        url = `/api/datacat/characters?${params}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
      }
    } catch (e) {
      console.error('Lumiverse drawer fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCatalog();
    }
  }, [isOpen, currentSource, currentSort, selectedTag, currentPage, nsfw]);

  if (!isOpen) return null;

  const currentPlatform = LUMIVERSE_PLATFORMS[currentSource];
  const filteredTags = currentPlatform.tags.filter((t) =>
    t.toLowerCase().includes(tagFilterInput.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-md h-full bg-[#090a0f] border-l border-neutral-800 text-neutral-100 shadow-2xl overflow-hidden font-sans">
        {/* Lumiverse Header Ribbon with Rose */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 px-3.5 py-2.5 bg-[#12141c]">
          <div className="flex items-center gap-2">
            <RoseIcon size={22} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight">Character Hub</span>
                <span className="rounded bg-rose-500/20 text-rose-300 text-[9px] font-mono px-1.5 py-0.2">
                  Lumiverse Preset
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">Chub.ai • Janny AI • Datacat Spindle Extension</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Platform Segmented Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-[#12141c] border-b border-white/5">
          <button
            onClick={() => setCurrentSource('chub')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
              currentSource === 'chub'
                ? 'bg-[#e11d48] text-white shadow-md shadow-rose-900/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            Chub.ai
          </button>
          <button
            onClick={() => setCurrentSource('janny')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
              currentSource === 'janny'
                ? 'bg-[#e11d48] text-white shadow-md shadow-rose-900/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            Janny AI
          </button>
          <button
            onClick={() => setCurrentSource('datacat')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
              currentSource === 'datacat'
                ? 'bg-[#e11d48] text-white shadow-md shadow-rose-900/40'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
            }`}
          >
            Datacat
          </button>
        </div>

        {/* Search Bar & Tag Button */}
        <div className="flex items-center gap-1.5 p-2 bg-[#090a0f]">
          <div className="flex-1 flex items-center bg-[#12141c] border border-white/10 rounded-lg px-2.5 py-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCatalog()}
              placeholder="Search characters or paste link..."
              className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none py-1"
            />
          </div>
          <button
            onClick={() => setIsTagModalOpen(true)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
              selectedTag
                ? 'border-[#e11d48] bg-rose-500/20 text-rose-300'
                : 'border-white/10 bg-[#12141c] text-neutral-400 hover:text-white'
            }`}
          >
            <Tag className="h-3 w-3" />
            <span className="truncate max-w-[70px]">{selectedTag ? selectedTag : 'Tags'}</span>
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              fetchCatalog();
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#e11d48] text-white hover:bg-rose-500 transition-colors shadow-sm"
          >
            Search
          </button>
        </div>

        {/* Compact Sort Strip & Explicit NSFW Setting */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#0e1017] border-y border-white/5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => {
                setCurrentSort(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#12141c] border border-white/10 text-neutral-200 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
            >
              {currentPlatform.sorts.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#12141c] text-neutral-200">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Explicit NSFW Setting Checkbox (toggled on by default) */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-neutral-300 hover:text-white">
            <input
              type="checkbox"
              id="omni-nsfw"
              checked={nsfw}
              onChange={(e) => onToggleNsfw(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#e11d48] rounded cursor-pointer"
            />
            <span className={`font-semibold ${nsfw ? 'text-rose-400' : 'text-neutral-400'}`}>
              NSFW
            </span>
            <span className="text-[9px] px-1 rounded bg-rose-500/10 text-rose-300 font-mono">
              {nsfw ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>

        {/* Dedicated Tag Filter Modal */}
        {isTagModalOpen && (
          <div className="absolute inset-0 z-40 flex flex-col bg-[#090a0f] p-3 gap-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white">Select Filter Tag ({currentPlatform.name})</span>
              <button
                onClick={() => setIsTagModalOpen(false)}
                className="px-2 py-0.5 text-xs rounded bg-[#12141c] text-neutral-400 hover:text-white border border-white/10"
              >
                &times; Close
              </button>
            </div>
            <div className="flex items-center bg-[#12141c] border border-white/10 rounded-lg px-2.5 py-1">
              <input
                type="text"
                value={tagFilterInput}
                onChange={(e) => setTagFilterInput(e.target.value)}
                placeholder="Type tag name to filter..."
                className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <button
                onClick={() => {
                  setSelectedTag('');
                  setIsTagModalOpen(false);
                }}
                className="text-rose-400 hover:underline"
              >
                Clear Selected Tag
              </button>
              <span className="text-neutral-400">Active: {selectedTag || 'None'}</span>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-wrap gap-1.5 content-start pt-1">
              {filteredTags.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTag(t);
                    setIsTagModalOpen(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    selectedTag.toLowerCase() === t.toLowerCase()
                      ? 'bg-[#e11d48] text-white border-[#e11d48]'
                      : 'bg-[#12141c] text-neutral-400 border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2-Column Responsive Card Grid (Lumiverse 1:1.25 ratio) */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="aspect-[1/1.3] bg-[#12141c] rounded-lg animate-pulse" />
                ))}
            </div>
          ) : characters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-500">
              <Bot className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-xs">No characters found matching criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {characters.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveChar(c)}
                  className="group flex flex-col bg-[#12141c] border border-white/5 rounded-lg overflow-hidden cursor-pointer hover:border-rose-500/40 hover:-translate-y-0.5 transition-all"
                >
                  <div className="relative w-full aspect-[1/1.25] bg-[#0b0d13] overflow-hidden">
                    <img
                      src={c.avatarUrl}
                      alt={c.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-200"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-black/75 text-white">
                      {c.sourceName || c.sourceId || currentSource}
                    </span>
                    {c.isNsfw && (
                      <span className="absolute top-1 right-1 px-1 py-0.5 text-[8px] font-bold rounded bg-rose-600 text-white">
                        NSFW
                      </span>
                    )}
                  </div>
                  <div className="p-2 flex flex-col flex-1 justify-between gap-1">
                    <div>
                      <h4 className="text-[12px] font-bold text-white truncate leading-tight">{c.name}</h4>
                      <p className="text-[10px] text-neutral-400 truncate">by {c.creator}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-white/5">
                      <span>⬇️ {(c.chubMetadata?.downloadCount || c.janitorMetadata?.chatCount || 0).toLocaleString()}</span>
                      <span>{c.totalTokens ? `${c.totalTokens.toLocaleString()} tok` : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-white/5 bg-[#12141c]">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 text-xs rounded border border-white/10 bg-[#12141c] text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral-800 transition-colors"
          >
            &lt; Prev
          </button>
          <span className="text-[11px] font-bold text-neutral-400">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-2.5 py-1 text-xs rounded border border-white/10 bg-[#12141c] text-white hover:bg-neutral-800 transition-colors"
          >
            Next &gt;
          </button>
        </div>

        {/* Lumiverse Contained Character Inspector */}
        {activeChar && (
          <div className="absolute inset-0 z-50 flex flex-col bg-[#090a0f] animate-in slide-in-from-right duration-200">
            {/* Inspector Topbar */}
            <div className="flex items-center gap-2 p-2.5 bg-[#12141c] border-b border-white/10">
              <button
                onClick={() => setActiveChar(null)}
                className="px-2 py-1 text-xs rounded border border-white/10 bg-[#12141c] text-neutral-300 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <img
                src={activeChar.avatarUrl}
                alt={activeChar.name}
                onClick={() => setPreviewImage(activeChar.avatarUrl)}
                className="h-10 w-10 rounded-md object-cover cursor-pointer border border-rose-500/40"
                title="Tap to preview image"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-white truncate">{activeChar.name}</h3>
                <p className="text-[10px] text-neutral-400 truncate">
                  by {activeChar.creator} • {activeChar.sourceName || currentSource}
                </p>
              </div>
              <button
                onClick={() => {
                  onSaveToLibrary(activeChar);
                  alert(`Imported "${activeChar.name}" to your library!`);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#e11d48] text-white hover:bg-rose-500 shadow-sm"
              >
                <Download className="h-3 w-3" />
                <span>Import</span>
              </button>
            </div>

            {/* Inspector Subtabs */}
            <div className="flex gap-1 px-2.5 py-1.5 bg-[#0b0d13] border-b border-white/5 overflow-x-auto text-[11px]">
              <button
                onClick={() => setInspectorTab('greetings')}
                className={`px-2 py-1 rounded border whitespace-nowrap ${
                  inspectorTab === 'greetings'
                    ? 'bg-[#e11d48] text-white border-[#e11d48] font-bold'
                    : 'bg-[#12141c] text-neutral-400 border-white/5'
                }`}
              >
                💬 Greetings (1)
              </button>
              <button
                onClick={() => setInspectorTab('definition')}
                className={`px-2 py-1 rounded border whitespace-nowrap ${
                  inspectorTab === 'definition'
                    ? 'bg-[#e11d48] text-white border-[#e11d48] font-bold'
                    : 'bg-[#12141c] text-neutral-400 border-white/5'
                }`}
              >
                🎭 Definition
              </button>
              <button
                onClick={() => setInspectorTab('summary')}
                className={`px-2 py-1 rounded border whitespace-nowrap ${
                  inspectorTab === 'summary'
                    ? 'bg-[#e11d48] text-white border-[#e11d48] font-bold'
                    : 'bg-[#12141c] text-neutral-400 border-white/5'
                }`}
              >
                📖 Summary & Notes
              </button>
              <button
                onClick={() => setInspectorTab('stats')}
                className={`px-2 py-1 rounded border whitespace-nowrap ${
                  inspectorTab === 'stats'
                    ? 'bg-[#e11d48] text-white border-[#e11d48] font-bold'
                    : 'bg-[#12141c] text-neutral-400 border-white/5'
                }`}
              >
                📊 Specs
              </button>
            </div>

            {/* Inspector Body Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs leading-relaxed text-neutral-200">
              {inspectorTab === 'greetings' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase text-emerald-400">Primary First Message</div>
                  <div className="bg-[#12141c] border border-emerald-500/30 p-2.5 rounded-lg whitespace-pre-wrap">
                    {activeChar.firstMessage || 'No greeting defined.'}
                  </div>
                  {activeChar.alternateGreetings?.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[10px] font-bold uppercase text-rose-400">
                        Alternate Greetings ({activeChar.alternateGreetings.length})
                      </div>
                      {activeChar.alternateGreetings.map((g: string, i: number) => (
                        <div key={i} className="bg-[#12141c] border border-rose-500/20 p-2.5 rounded-lg whitespace-pre-wrap">
                          <div className="text-[9px] font-bold text-rose-300 mb-1">Greeting #{i + 2}</div>
                          {g}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {inspectorTab === 'definition' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase text-emerald-400">Prompt Definition</div>
                  <div className="bg-[#12141c] border border-white/5 p-2.5 rounded-lg whitespace-pre-wrap">
                    {activeChar.description || 'No prompt definition visible.'}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-rose-400">Personality</div>
                  <div className="bg-[#12141c] border border-white/5 p-2.5 rounded-lg whitespace-pre-wrap">
                    {activeChar.personality || 'No personality definition visible.'}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-rose-400">Scenario</div>
                  <div className="bg-[#12141c] border border-white/5 p-2.5 rounded-lg whitespace-pre-wrap">
                    {activeChar.scenario || 'No specific scenario.'}
                  </div>
                </div>
              )}

              {inspectorTab === 'summary' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase text-rose-400">Catalog Summary</div>
                  <div className="bg-[#12141c] border border-white/5 p-2.5 rounded-lg whitespace-pre-wrap">
                    {activeChar.description || 'No summary provided.'}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-rose-400">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {activeChar.tags?.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 text-[10px] rounded-full bg-[#12141c] border border-white/10 text-neutral-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {inspectorTab === 'stats' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase text-rose-400">Specifications</div>
                  <div className="bg-[#12141c] border border-white/5 p-2.5 rounded-lg space-y-1 text-xs">
                    <p>• Estimated Total Tokens: <b>{activeChar.totalTokens?.toLocaleString() || 'N/A'}</b></p>
                    <p>• Source: <b>{(activeChar.sourceName || currentSource).toUpperCase()}</b></p>
                    <p>• Format: <b>Character Card V2 (CCv2)</b></p>
                    <p>• NSFW Flag: <b>{activeChar.isNsfw ? 'Yes (Explicit)' : 'No (SFW)'}</b></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Image Preview Modal */}
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 cursor-pointer"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 px-3 py-1 text-xs rounded bg-[#12141c] border border-white/20 text-white"
            >
              &times; Close
            </button>
            <img src={previewImage} alt="Preview" className="max-w-[90%] max-h-[80%] object-contain rounded-lg shadow-2xl" />
            <span className="text-[11px] text-neutral-500 mt-2">Tap anywhere to close</span>
          </div>
        )}
      </div>
    </div>
  );
};
