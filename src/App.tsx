import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CharacterSource,
  CharacterItem,
} from './types/character.ts';
import {
  getLocalLibrary,
  addCharacterToLibrary,
  removeCharacterFromLibrary,
  toggleCharacterFavorite,
  saveLocalLibrary,
  getUserPreferences,
  saveUserPreferences,
  getUniqueSourceSpaces,
  UserPreferences,
} from './utils/storage.ts';
import { Navbar } from './components/Navbar.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { CharacterCard } from './components/CharacterCard.tsx';
import { JanitorProfileModal } from './components/profiles/JanitorProfileModal.tsx';
import { ChubProfileModal } from './components/profiles/ChubProfileModal.tsx';
import { DatacatProfileModal } from './components/profiles/DatacatProfileModal.tsx';
import { LocalProfileModal } from './components/profiles/LocalProfileModal.tsx';
import { ImportModal } from './components/ImportModal.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import {
  Loader2,
  RefreshCw,
  FolderOpen,
  Bot,
  AlertCircle,
  Database,
  Sparkles,
  Compass,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TagOption {
  id: string | number;
  name: string;
  slug: string;
}

export const App: React.FC = () => {
  // Navigation & Preferences State
  const [activeSource, setActiveSource] = useState<CharacterSource>('datacat');
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());
  const [localLibrary, setLocalLibrary] = useState<CharacterItem[]>(getLocalLibrary());

  // Per-source search & filter states so each website is completely independent
  const [datacatQuery, setDatacatQuery] = useState('');
  const [datacatSort, setDatacatSort] = useState('recent');
  const [datacatSelectedTags, setDatacatSelectedTags] = useState<string[]>([]);
  const [datacatPage, setDatacatPage] = useState(1);

  const [janitorQuery, setJanitorQuery] = useState('');
  const [janitorSort, setJanitorSort] = useState('trending');
  const [janitorSelectedTags, setJanitorSelectedTags] = useState<string[]>([]);
  const [janitorPage, setJanitorPage] = useState(1);

  const [chubQuery, setChubQuery] = useState('');
  const [chubSort, setChubSort] = useState('download_count');
  const [chubSelectedTags, setChubSelectedTags] = useState<string[]>([]);
  const [chubPage, setChubPage] = useState(1);

  const [localQuery, setLocalQuery] = useState('');
  const [localSort, setLocalSort] = useState('date_desc');
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>([]);
  const [selectedSpace, setSelectedSpace] = useState('All');

  const [tagMatchMode, setTagMatchMode] = useState<'and' | 'or'>('or');

  // Available tags loaded from the respective source
  const [datacatTags, setDatacatTags] = useState<TagOption[]>([]);
  const [janitorTags, setJanitorTags] = useState<TagOption[]>([]);
  const [chubTags, setChubTags] = useState<TagOption[]>([]);

  // Results & Loading State
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Active Profile
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    const newPrefs = saveUserPreferences(updated);
    setPreferences(newPrefs);
  };

  // Load tag taxonomies for all sources on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Fetch Janitor tags
        const jRes = await fetch('/api/janitor/tags');
        if (jRes.ok) {
          const jData = await jRes.json();
          if (jData.tags) setJanitorTags(jData.tags);
        }

        // Fetch Chub tags
        const cRes = await fetch('/api/chub/tags');
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.tags) setChubTags(cData.tags);
        }

        // Fetch Datacat tags/facets
        const dRes = await fetch('/api/datacat/taxonomy');
        if (dRes.ok) {
          const dData = await dRes.json();
          if (dData.taxonomy?.tags) {
            setDatacatTags(
              dData.taxonomy.tags.slice(0, 40).map((t: any) => ({
                id: t.id,
                name: t.name,
                slug: t.slug || t.name.toLowerCase(),
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Could not fetch source tags:', err);
      }
    };
    fetchTags();
  }, []);

  // Fetch characters whenever activeSource or source-specific filters change
  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (activeSource === 'datacat') {
        const params = new URLSearchParams();
        if (datacatQuery) params.set('search', datacatQuery);
        params.set('sort', datacatSort);
        params.set('offset', String((datacatPage - 1) * 30));
        params.set('limit', '30');

        if (datacatSelectedTags.length > 0) {
          // Find matching tag IDs
          const tagIds = datacatTags
            .filter((t) => datacatSelectedTags.includes(t.name) || datacatSelectedTags.includes(t.slug))
            .map((t) => t.id)
            .join(',');
          if (tagIds) params.set('tagIds', tagIds);
        }

        const res = await fetch(`/api/datacat/characters?${params.toString()}`);
        if (!res.ok) throw new Error(`Datacat request failed: ${res.statusText}`);
        const data = await res.json();
        let list: CharacterItem[] = data.characters || [];
        if (preferences.safeMode) {
          list = list.filter((c) => !c.isNsfw);
        }
        setCharacters(list);
      } else if (activeSource === 'janitor') {
        const params = new URLSearchParams();
        if (janitorQuery) params.set('search', janitorQuery);
        params.set('sort', janitorSort);
        params.set('offset', String((janitorPage - 1) * 30));
        params.set('limit', '30');

        if (janitorSelectedTags.length > 0) {
          const matchingTag = janitorTags.find(
            (t) => janitorSelectedTags.includes(t.name) || janitorSelectedTags.includes(t.slug)
          );
          if (matchingTag) {
            params.set('tagId', String(matchingTag.id));
          }
        }

        const res = await fetch(`/api/janitor/characters?${params.toString()}`);
        if (!res.ok) throw new Error(`JanitorAI request failed: ${res.statusText}`);
        const data = await res.json();
        let list: CharacterItem[] = data.characters || [];
        if (preferences.safeMode) {
          list = list.filter((c) => !c.isNsfw);
        }
        setCharacters(list);
      } else if (activeSource === 'chub') {
        const params = new URLSearchParams();
        if (chubQuery) params.set('search', chubQuery);
        params.set('sort', chubSort);
        params.set('offset', String((chubPage - 1) * 30));
        params.set('limit', '30');
        if (chubSelectedTags.length > 0) {
          params.set('tag', chubSelectedTags[0]);
        }

        const res = await fetch(`/api/chub/characters?${params.toString()}`);
        if (!res.ok) throw new Error(`Chub request failed: ${res.statusText}`);
        const data = await res.json();
        let list: CharacterItem[] = data.characters || [];
        if (preferences.safeMode) {
          list = list.filter((c) => !c.isNsfw);
        }
        setCharacters(list);
      } else if (activeSource === 'local') {
        // Query local storage
        let list = [...localLibrary];

        // Filter by Space
        if (selectedSpace !== 'All') {
          list = list.filter((c) => c.localMetadata?.sourceSpace === selectedSpace);
        }

        // Search query
        if (localQuery.trim()) {
          const q = localQuery.toLowerCase();
          list = list.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.creator.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q)
          );
        }

        // Tags
        if (localSelectedTags.length > 0) {
          list = list.filter((c) =>
            tagMatchMode === 'and'
              ? localSelectedTags.every((t) => c.tags.includes(t))
              : localSelectedTags.some((t) => c.tags.includes(t))
          );
        }

        // Sort
        if (localSort === 'fav_first') {
          list.sort((a, b) => (b.localMetadata?.isFavorite ? 1 : 0) - (a.localMetadata?.isFavorite ? 1 : 0));
        } else if (localSort === 'name_asc') {
          list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (localSort === 'date_desc') {
          list.sort((a, b) => {
            const timeA = new Date(a.localMetadata?.importedAt || 0).getTime();
            const timeB = new Date(b.localMetadata?.importedAt || 0).getTime();
            return timeB - timeA;
          });
        }

        setCharacters(list);
      }
    } catch (err: any) {
      console.error('Fetch characters error:', err);
      setError(err.message || 'Failed to fetch characters');
    } finally {
      setIsLoading(false);
    }
  }, [
    activeSource,
    datacatQuery,
    datacatSort,
    datacatSelectedTags,
    datacatPage,
    datacatTags,
    janitorQuery,
    janitorSort,
    janitorSelectedTags,
    janitorPage,
    janitorTags,
    chubQuery,
    chubSort,
    chubSelectedTags,
    chubPage,
    localLibrary,
    localQuery,
    localSort,
    localSelectedTags,
    selectedSpace,
    tagMatchMode,
    preferences.safeMode,
  ]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  // Current tags and search controls based on active source
  const currentQuery =
    activeSource === 'datacat'
      ? datacatQuery
      : activeSource === 'janitor'
      ? janitorQuery
      : activeSource === 'chub'
      ? chubQuery
      : localQuery;

  const currentSort =
    activeSource === 'datacat'
      ? datacatSort
      : activeSource === 'janitor'
      ? janitorSort
      : activeSource === 'chub'
      ? chubSort
      : localSort;

  const currentSelectedTags =
    activeSource === 'datacat'
      ? datacatSelectedTags
      : activeSource === 'janitor'
      ? janitorSelectedTags
      : activeSource === 'chub'
      ? chubSelectedTags
      : localSelectedTags;

  const currentAvailableTags: TagOption[] = useMemo(() => {
    if (activeSource === 'datacat') return datacatTags;
    if (activeSource === 'janitor') return janitorTags;
    if (activeSource === 'chub') return chubTags;
    // For local, extract unique tags from localLibrary
    const tagSet = new Set<string>();
    localLibrary.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).map((name) => ({ id: name, name, slug: name.toLowerCase() }));
  }, [activeSource, datacatTags, janitorTags, chubTags, localLibrary]);

  const handleQueryChange = (q: string) => {
    if (activeSource === 'datacat') {
      setDatacatQuery(q);
      setDatacatPage(1);
    } else if (activeSource === 'janitor') {
      setJanitorQuery(q);
      setJanitorPage(1);
    } else if (activeSource === 'chub') {
      setChubQuery(q);
      setChubPage(1);
    } else {
      setLocalQuery(q);
    }
  };

  const handleSortChange = (s: string) => {
    if (activeSource === 'datacat') setDatacatSort(s);
    else if (activeSource === 'janitor') setJanitorSort(s);
    else if (activeSource === 'chub') setChubSort(s);
    else setLocalSort(s);
  };

  const handleToggleTag = (tag: string) => {
    const updateList = (prev: string[]) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];

    if (activeSource === 'datacat') {
      setDatacatSelectedTags(updateList);
      setDatacatPage(1);
    } else if (activeSource === 'janitor') {
      setJanitorSelectedTags(updateList);
      setJanitorPage(1);
    } else if (activeSource === 'chub') {
      setChubSelectedTags(updateList);
      setChubPage(1);
    } else {
      setLocalSelectedTags(updateList);
    }
  };

  const handleClearTags = () => {
    if (activeSource === 'datacat') setDatacatSelectedTags([]);
    else if (activeSource === 'janitor') setJanitorSelectedTags([]);
    else if (activeSource === 'chub') setChubSelectedTags([]);
    else setLocalSelectedTags([]);
  };

  // Character Actions
  const handleSaveToLibrary = (char: CharacterItem) => {
    const saved = addCharacterToLibrary(char);
    setLocalLibrary(getLocalLibrary());
    addToast('success', `Saved "${saved.name}" to your library.`);
  };

  const handleToggleFavorite = (id: string) => {
    const isFav = toggleCharacterFavorite(id);
    setLocalLibrary(getLocalLibrary());
    addToast('info', isFav ? 'Marked as favorite' : 'Removed from favorites');
  };

  const handleUpdateLocalCharacter = (updated: CharacterItem) => {
    const lib = getLocalLibrary();
    const idx = lib.findIndex((c) => c.id === updated.id);
    if (idx >= 0) {
      lib[idx] = updated;
      saveLocalLibrary(lib);
      setLocalLibrary(lib);
      setSelectedCharacter(updated);
      addToast('success', 'Character changes saved.');
    }
  };

  const handleDeleteLocalCharacter = (id: string) => {
    removeCharacterFromLibrary(id);
    setLocalLibrary(getLocalLibrary());
    addToast('info', 'Character deleted from library.');
  };

  const handleImportSuccess = (newChar: CharacterItem) => {
    addCharacterToLibrary(newChar, newChar.localMetadata?.sourceSpace);
    setLocalLibrary(getLocalLibrary());
    addToast('success', `Imported "${newChar.name}" to Library!`);
    setActiveSource('local');
  };

  const savedIds = useMemo(() => new Set(localLibrary.map((c) => c.id)), [localLibrary]);
  const sourceSpaces = useMemo(() => getUniqueSourceSpaces(localLibrary), [localLibrary]);

  // Open full character with details
  const handleSelectCharacter = async (char: CharacterItem) => {
    // If it already has full detail fields or is local, show directly
    if (char.sourceId === 'local' || char.firstMessage || char.personality) {
      setSelectedCharacter(char);
      return;
    }

    // Otherwise fetch full details from source API
    try {
      if (char.sourceId === 'datacat') {
        const res = await fetch(`/api/datacat/character/${encodeURIComponent(char.id)}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedCharacter(data.character || char);
          return;
        }
      } else if (char.sourceId === 'janitor') {
        const res = await fetch(`/api/janitor/character/${encodeURIComponent(char.id)}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedCharacter(data.character || char);
          return;
        }
      } else if (char.sourceId === 'chub') {
        const res = await fetch(`/api/chub/character/${encodeURIComponent(char.id)}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedCharacter(data.character || char);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load extra character details, showing card data:', e);
    }

    setSelectedCharacter(char);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeSource={activeSource}
        onSelectSource={(source) => {
          setActiveSource(source);
          setError(null);
        }}
        libraryCount={localLibrary.length}
        onOpenImport={() => setIsImportModalOpen(true)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Source Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {activeSource === 'datacat' && <Database className="h-5 w-5 text-sky-400" />}
                {activeSource === 'janitor' && <Sparkles className="h-5 w-5 text-indigo-400" />}
                {activeSource === 'chub' && <Compass className="h-5 w-5 text-emerald-400" />}
                {activeSource === 'local' && <BookmarkCheck className="h-5 w-5 text-amber-400" />}
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {activeSource === 'datacat' && 'Datacat Character Index'}
                  {activeSource === 'janitor' && 'JanitorAI Community Library'}
                  {activeSource === 'chub' && 'Chub.ai Character Repository'}
                  {activeSource === 'local' && 'My Offline Character Library'}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                {activeSource === 'datacat' &&
                  'Official Datacat search engine with authentic taxonomy facets, recovery state tracking, and full token weights breakdown.'}
                {activeSource === 'janitor' &&
                  'Independent JanitorAI archive with authentic chat & message counts, proxy availability indicators, and Janitor-style chat profiles.'}
                {activeSource === 'chub' &&
                  'Dedicated Chub card browser featuring star ratings, download statistics, Tavern V2 card definitions, and lorebook exports.'}
                {activeSource === 'local' &&
                  'Your private collection of imported Tavern PNG cards and JSON cards, organized into custom spaces with zero telemetry.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={fetchCharacters}
                disabled={isLoading}
                title="Refresh Results"
                className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Filter & Search Bar */}
        <FilterBar
          source={activeSource}
          query={currentQuery}
          onQueryChange={handleQueryChange}
          sortBy={currentSort}
          onSortByChange={handleSortChange}
          availableTags={currentAvailableTags}
          selectedTags={currentSelectedTags}
          onToggleTag={handleToggleTag}
          onClearTags={handleClearTags}
          tagMatchMode={tagMatchMode}
          onToggleTagMatchMode={() =>
            setTagMatchMode((m) => (m === 'and' ? 'or' : 'and'))
          }
          sourceSpaces={sourceSpaces}
          selectedSpace={selectedSpace}
          onSelectSpace={setSelectedSpace}
          totalResultsCount={characters.length}
          isLoading={isLoading}
        />

        {/* Content Section: Grid of Cards / Loading / Error */}
        {error ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-900/40 bg-rose-950/20 p-12 text-center">
            <AlertCircle className="h-10 w-10 text-rose-400 mb-3" />
            <h3 className="font-bold text-base text-rose-200">Unable to load characters</h3>
            <p className="text-xs text-rose-300/80 max-w-md mt-1">{error}</p>
            <button
              onClick={fetchCharacters}
              className="mt-4 rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-3" />
            <p className="text-sm font-medium text-neutral-300">
              Querying {activeSource === 'datacat' ? 'Datacat' : activeSource === 'janitor' ? 'JanitorAI' : activeSource === 'chub' ? 'Chub.ai' : 'Library'}...
            </p>
            <p className="text-xs text-neutral-500 mt-1">Retrieving authentic character definitions</p>
          </div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-neutral-800/80 bg-neutral-900/30 p-16 text-center">
            <Bot className="h-12 w-12 text-neutral-600 mb-3" />
            <h3 className="font-bold text-base text-neutral-200">No characters found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mt-1">
              {currentQuery || currentSelectedTags.length > 0
                ? 'Try broadening your search term or clearing active tags.'
                : activeSource === 'local'
                ? 'Your library is currently empty. Click "Import Card" to add cards.'
                : 'No characters returned for this category.'}
            </p>
            {activeSource === 'local' && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-md"
              >
                Import Your First Card
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-4 sm:gap-6 ${
              preferences.density === 'comfortable'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
            }`}
          >
            {characters.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onSelect={handleSelectCharacter}
                onSaveToLibrary={handleSaveToLibrary}
                onToggleFavorite={handleToggleFavorite}
                isSaved={savedIds.has(char.id)}
                density={preferences.density}
              />
            ))}
          </div>
        )}

        {/* Pagination Footer for Remote Sources */}
        {activeSource !== 'local' && characters.length > 0 && !isLoading && (
          <div className="flex items-center justify-between border-t border-neutral-800/80 pt-4 text-xs text-neutral-400">
            <span>
              Showing page{' '}
              {activeSource === 'datacat'
                ? datacatPage
                : activeSource === 'janitor'
                ? janitorPage
                : chubPage}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={
                  (activeSource === 'datacat' && datacatPage <= 1) ||
                  (activeSource === 'janitor' && janitorPage <= 1) ||
                  (activeSource === 'chub' && chubPage <= 1)
                }
                onClick={() => {
                  if (activeSource === 'datacat') setDatacatPage((p) => Math.max(1, p - 1));
                  else if (activeSource === 'janitor') setJanitorPage((p) => Math.max(1, p - 1));
                  else if (activeSource === 'chub') setChubPage((p) => Math.max(1, p - 1));
                }}
                className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => {
                  if (activeSource === 'datacat') setDatacatPage((p) => p + 1);
                  else if (activeSource === 'janitor') setJanitorPage((p) => p + 1);
                  else if (activeSource === 'chub') setChubPage((p) => p + 1);
                }}
                className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Source-Specific Character Profile Modals */}
      {selectedCharacter && selectedCharacter.sourceId === 'janitor' && (
        <JanitorProfileModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onSaveToLibrary={handleSaveToLibrary}
          isSaved={savedIds.has(selectedCharacter.id)}
        />
      )}

      {selectedCharacter && selectedCharacter.sourceId === 'chub' && (
        <ChubProfileModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onSaveToLibrary={handleSaveToLibrary}
          isSaved={savedIds.has(selectedCharacter.id)}
        />
      )}

      {selectedCharacter && selectedCharacter.sourceId === 'datacat' && (
        <DatacatProfileModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onSaveToLibrary={handleSaveToLibrary}
          isSaved={savedIds.has(selectedCharacter.id)}
        />
      )}

      {selectedCharacter && selectedCharacter.sourceId === 'local' && (
        <LocalProfileModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onUpdate={handleUpdateLocalCharacter}
          onDelete={handleDeleteLocalCharacter}
          onToggleFavorite={handleToggleFavorite}
          availableSpaces={sourceSpaces}
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={handleImportSuccess}
          existingSpaces={sourceSpaces}
        />
      )}

      {/* Floating Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
};
