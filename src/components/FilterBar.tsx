import React, { useRef, useEffect } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Filter,
  FolderOpen,
} from 'lucide-react';
import { CharacterSource } from '../types/character.ts';

interface TagOption {
  id: string | number;
  name: string;
  slug: string;
}

interface FilterBarProps {
  source: CharacterSource;
  query: string;
  onQueryChange: (q: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  availableTags: TagOption[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  tagMatchMode: 'and' | 'or';
  onToggleTagMatchMode: () => void;
  sourceSpaces?: string[];
  selectedSpace?: string;
  onSelectSpace?: (space: string) => void;
  totalResultsCount?: number;
  isLoading?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  source,
  query,
  onQueryChange,
  sortBy,
  onSortByChange,
  availableTags,
  selectedTags,
  onToggleTag,
  onClearTags,
  tagMatchMode,
  onToggleTagMatchMode,
  sourceSpaces = [],
  selectedSpace = 'All',
  onSelectSpace,
  totalResultsCount,
  isLoading,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: press '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getSortOptions = () => {
    switch (source) {
      case 'datacat':
        return [
          { value: 'recent', label: 'Most Recent' },
          { value: 'trending', label: 'Trending' },
          { value: 'popular', label: 'Most Popular' },
          { value: 'tokens', label: 'Highest Tokens' },
        ];
      case 'janny':
      case 'janitor':
        return [
          { value: 'recent', label: 'Most Recent' },
          { value: 'popular', label: 'All-Time Popular' },
          { value: 'messages', label: 'Most Messages' },
          { value: 'tokens', label: 'Total Tokens' },
        ];
      case 'chub':
        return [
          { value: 'download_count', label: 'Most Downloaded' },
          { value: 'rating', label: 'Highest Rated' },
          { value: 'star_count', label: 'Most Starred' },
          { value: 'created_at', label: 'Newest Cards' },
        ];
      case 'local':
        return [
          { value: 'date_desc', label: 'Recently Added' },
          { value: 'fav_first', label: 'Favorites First' },
          { value: 'name_asc', label: 'Alphabetical' },
        ];
    }
  };

  const getSourceBadge = () => {
    switch (source) {
      case 'datacat':
        return { label: 'Datacat Native Index', color: 'border-sky-500/30 text-sky-400 bg-sky-500/10' };
      case 'janny':
      case 'janitor':
        return { label: 'Janny AI Archive', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' };
      case 'chub':
        return { label: 'Chub.ai Repository', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' };
      case 'local':
        return { label: 'Local Persistent Storage', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' };
    }
  };

  const badge = getSourceBadge();
  const sourceDisplayName =
    source === 'datacat'
      ? 'Datacat'
      : source === 'janny' || source === 'janitor'
      ? 'Janny AI'
      : source === 'chub'
      ? 'Chub.ai'
      : 'Library';

  return (
    <div className="space-y-4">
      {/* Top Search & Source Controls Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-neutral-500" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={`Search ${sourceDisplayName} characters... (Press '/' to search)`}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2.5 pl-10 pr-20 text-sm text-neutral-100 placeholder-neutral-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1.5">
            {query && (
              <button
                onClick={() => onQueryChange('')}
                className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 shadow-sm">
              /
            </kbd>
          </div>
        </div>

        {/* Filter Controls & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Source Space Dropdown for Local Library */}
          {source === 'local' && sourceSpaces.length > 1 && onSelectSpace && (
            <div className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs">
              <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-neutral-400">Space:</span>
              <select
                value={selectedSpace}
                onChange={(e) => onSelectSpace(e.target.value)}
                className="bg-transparent font-medium text-neutral-200 focus:outline-none cursor-pointer"
              >
                {sourceSpaces.map((s) => (
                  <option key={s} value={s} className="bg-neutral-900 text-neutral-200">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-neutral-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-transparent font-medium text-neutral-200 focus:outline-none cursor-pointer"
            >
              {getSortOptions().map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-neutral-900 text-neutral-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium ${badge.color}`}>
            <span>{badge.label}</span>
            {typeof totalResultsCount === 'number' && (
              <span className="opacity-80">({totalResultsCount})</span>
            )}
          </div>
        </div>
      </div>

      {/* Tags Filter Row */}
      {availableTags.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-400">
              <Tag className="h-3.5 w-3.5 text-neutral-400" />
              <span className="font-semibold text-neutral-300">
                Source Tags & Facets
              </span>
              {selectedTags.length > 0 && (
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  {selectedTags.length} active
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* AND / OR Match Mode Toggle */}
              {selectedTags.length > 1 && (
                <button
                  onClick={onToggleTagMatchMode}
                  className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-300 hover:bg-neutral-700 transition-colors"
                >
                  Match: <span className="text-indigo-400 uppercase">{tagMatchMode}</span>
                </button>
              )}

              {/* Clear Tags */}
              {selectedTags.length > 0 && (
                <button
                  onClick={onClearTags}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <X className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Tag Chips List */}
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name) || selectedTags.includes(tag.slug);
              return (
                <button
                  key={tag.id || tag.slug}
                  onClick={() => onToggleTag(tag.name)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                      : 'border border-neutral-800 bg-neutral-800/60 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
