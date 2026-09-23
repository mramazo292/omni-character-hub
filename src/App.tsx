import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { Sidebar } from './components/Sidebar.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { CharacterCard } from './components/CharacterCard.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
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
  LogIn,
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

  // Sidebar & Settings State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Per-source search & filter states so each website is completely independent
  const [datacatQuery, setDatacatQuery] = useState('');
  const [datacatSort, setDatacatSort] = useState('recent');
  const [datacatSelectedTags, setDatacatSelectedTags] = useState<string[]>([]);
  const [datacatPage, setDatacatPage] = useState(1);

  const [jannyQuery, setJannyQuery] = useState('');
  const [jannySort, setJannySort] = useState('recent');
  const [jannySelectedTags, setJannySelectedTags] = useState<string[]>([]);
  const [jannyPage, setJannyPage] = useState(1);

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
  const [jannyTags, setJannyTags] = useState<TagOption[]>([]);
  const [chubTags, setChubTags] = useState<TagOption[]>([]);

  // Results & Loading State
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Active Profile
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const mainContentRef = useRef<HTMLDivElement>(null);

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
    addToast('info', 'Preferences updated');
  };

  const handleResetPreferences = () => {
    const reset = saveUserPreferences({
      density: 'comfortable',
      viewMode: 'grid',
      pageSize: 24,
      safeMode: false,
      activeSourceSpace: 'All',
    });
    setPreferences(reset);
    addToast('info', 'Preferences reset to defaults');
  };

  const handleClearCache = () => {
    fetchCharacters();
    addToast('success', 'Cache cleared & refreshed character feed');
  };

  const handleExportLibrary = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localLibrary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `omni-hub-library-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('success', 'Library exported to JSON');
  };

  // The critical "Enter Hub" handler
  const handleEnterHub = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    fetchCharacters();
    addToast('info', 'Entered Omni Character Hub - Connected to Janny AI, Datacat & Chub');
  };

  // Load tags once upon mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Fetch Janny tags
        const jRes = await fetch('/api/janny/tags');
        if (jRes.ok) {
          const jData = await jRes.json();
          if (jData.tags) setJannyTags(jData.tags);
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
      } else if (activeSource === 'janny' || activeSource === 'janitor') {
        const params = new URLSearchParams();
        if (jannyQuery) params.set('search', jannyQuery);
        params.set('sort', jannySort);
        params.set('offset', String((jannyPage - 1) * 30));
        params.set('limit', '30');

        if (jannySelectedTags.length > 0) {
          const matchingTag = jannyTags.find(
            (t) => jannySelectedTags.includes(t.name) || jannySelectedTags.includes(t.slug)
          );
          if (matchingTag) {
            params.set('tagId', String(matchingTag.id));
          }
        }

        const res = await fetch(`/api/janny/characters?${params.toString()}`);
        if (!res.ok) throw new Error(`Janny AI request failed: ${res.statusText}`);
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
        let list = [...localLibrary];

        if (selectedSpace !== 'All') {
          list = list.filter((c) => c.localMetadata?.sourceSpace === selectedSpace);
        }

        if (localQuery) {
          const q = localQuery.toLowerCase();
          list = list.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q) ||
              c.creator.toLowerCase().includes(q) ||
              c.tags.some((t) => t.toLowerCase().includes(q))
          );
        }

        if (localSelectedTags.length > 0) {
          list = list.filter((c) => {
            if (tagMatchMode === 'and') {
              return localSelectedTags.every((t) => c.tags.includes(t));
            } else {
              return localSelectedTags.some((t) => c.tags.includes(t));
            }
          });
        }

        if (preferences.safeMode) {
          list = list.filter((c) => !c.isNsfw);
        }

        if (localSort === 'fav_first') {
          list.sort((a, b) => {
            const aFav = a.localMetadata?.isFavorite ? 1 : 0;
            const bFav = b.localMetadata?.isFavorite ? 1 : 0;
            return bFav - aFav;
          });
        } else if (localSort === 'name_asc') {
          list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (localSort === 'date_desc') {
          list.sort((a, b) => {
            const aDate = a.localMetadata?.importedAt ? new Date(a.localMetadata.importedAt).getTime() : 0;
            const bDate = b.localMetadata?.importedAt ? new Date(b.localMetadata.importedAt).getTime() : 0;
            return bDate - aDate;
          });
        }

        setCharacters(list);
      }
    } catch (err: any) {
      console.error('Character fetch error:', err);
      setError(err.message || 'Failed to fetch characters.');
    } finally {
      setIsLoading(false);
    }
  }, [
    activeSource,
    datacatQuery,
    datacatSort,
    datacatPage,
    datacatSelectedTags,
    datacatTags,
    jannyQuery,
    jannySort,
    jannyPage,
    jannySelectedTags,
    jannyTags,
    chubQuery,
    chubSort,
    chubPage,
    chubSelectedTags,
    localQuery,
    localSort,
    localSelectedTags,
    selectedSpace,
    tagMatchMode,
    localLibrary,
    preferences.safeMode,
  ]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const sourceSpaces = useMemo(() => getUniqueSourceSpaces(localLibrary), [localLibrary]);
  const savedIds = useMemo(() => new Set(localLibrary.map((c) => c.id)), [localLibrary]);

  const handleSaveToLibrary = (char: CharacterItem) => {
    if (savedIds.has(char.id)) {
      const updated = removeCharacterFromLibrary(char.id);
      setLocalLibrary(updated);
      addToast('info', `Removed "${char.name}" from library`);
    } else {
      const updated = addCharacterToLibrary(char, 'Default Space');
      setLocalLibrary(updated);
      addToast('success', `Saved "${char.name}" to library`);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleCharacterFavorite(id);
    setLocalLibrary(updated);
  };

  const handleUpdateLocalCharacter = (char: CharacterItem) => {
    const updated = localLibrary.map((c) => (c.id === char.id ? char : c));
    saveLocalLibrary(updated);
    setLocalLibrary(updated);
    setSelectedCharacter(char);
    addToast('success', 'Character details saved');
  };

  const handleDeleteLocalCharacter = (id: string) => {
    const updated = removeCharacterFromLibrary(id);
    setLocalLibrary(updated);
    setSelectedCharacter(null);
    addToast('info', 'Character deleted from library');
  };

  const handleImportSuccess = (newChar: CharacterItem) => {
    const updated = [newChar, ...localLibrary];
    saveLocalLibrary(updated);
    setLocalLibrary(updated);
    setIsImportModalOpen(false);
    addToast('success', `Successfully imported "${newChar.name}"`);
    setActiveSource('local');
  };

  const currentQuery = useMemo(() => {
    switch (activeSource) {
      case 'datacat':
        return datacatQuery;
      case 'janny':
      case 'janitor':
        return jannyQuery;
      case 'chub':
        return chubQuery;
      case 'local':
        return localQuery;
    }
  }, [activeSource, datacatQuery, jannyQuery, chubQuery, localQuery]);

  const handleQueryChange = (q: string) => {
    switch (activeSource) {
      case 'datacat':
        setDatacatQuery(q);
        setDatacatPage(1);
        break;
      case 'janny':
      case 'janitor':
        setJannyQuery(q);
        setJannyPage(1);
        break;
      case 'chub':
        setChubQuery(q);
        setChubPage(1);
        break;
      case 'local':
        setLocalQuery(q);
        break;
    }
  };

  const currentSort = useMemo(() => {
    switch (activeSource) {
      case 'datacat':
        return datacatSort;
      case 'janny':
      case 'janitor':
        return jannySort;
      case 'chub':
        return chubSort;
      case 'local':
        return localSort;
    }
  }, [activeSource, datacatSort, jannySort, chubSort, localSort]);

  const handleSortChange = (sort: string) => {
    switch (activeSource) {
      case 'datacat':
        setDatacatSort(sort);
        setDatacatPage(1);
        break;
      case 'janny':
      case 'janitor':
        setJannySort(sort);
        setJannyPage(1);
        break;
      case 'chub':
        setChubSort(sort);
        setChubPage(1);
        break;
      case 'local':
        setLocalSort(sort);
        break;
    }
  };

  const currentAvailableTags = useMemo(() => {
    switch (activeSource) {
      case 'datacat':
        return datacatTags;
      case 'janny':
      case 'janitor':
        return jannyTags;
      case 'chub':
        return chubTags;
      case 'local': {
        const tagMap = new Map<string, number>();
        localLibrary.forEach((c) => {
          c.tags.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1));
        });
        return Array.from(tagMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 30)
          .map(([name]) => ({ id: name, name, slug: name.toLowerCase() }));
      }
    }
  }, [activeSource, datacatTags, jannyTags, chubTags, localLibrary]);

  const currentSelectedTags = useMemo(() => {
    switch (activeSource) {
      case 'datacat':
        return datacatSelectedTags;
      case 'janny':
      case 'janitor':
        return jannySelectedTags;
      case 'chub':
        return chubSelectedTags;
      case 'local':
        return localSelectedTags;
    }
  }, [activeSource, datacatSelectedTags, jannySelectedTags, chubSelectedTags, localSelectedTags]);

  const handleToggleTag = (tag: string) => {
    const updateList = (prev: string[]) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];

    switch (activeSource) {
      case 'datacat':
        setDatacatSelectedTags(updateList);
        setDatacatPage(1);
        break;
      case 'janny':
      case 'janitor':
        setJannySelectedTags(updateList);
        setJannyPage(1);
        break;
      case 'chub':
        setChubSelectedTags(updateList);
        setChubPage(1);
        break;
      case 'local':
        setLocalSelectedTags(updateList);
        break;
    }
  };

  const handleClearTags = () => {
    switch (activeSource) {
      case 'datacat':
        setDatacatSelectedTags([]);
        break;
      case 'janny':
      case 'janitor':
        setJannySelectedTags([]);
        break;
      case 'chub':
        setChubSelectedTags([]);
        break;
      case 'local':
        setLocalSelectedTags([]);
        break;
    }
  };

  const handleSelectCharacter = async (char: CharacterItem) => {
    try {
      if (char.sourceId === 'datacat') {
        const res = await fetch(`/api/datacat/character/${encodeURIComponent(char.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.character) {
            setSelectedCharacter(data.character);
            return;
          }
        }
      } else if (char.sourceId === 'janny' || char.sourceId === 'janitor') {
        const res = await fetch(`/api/janny/character/${encodeURIComponent(char.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.character) {
            setSelectedCharacter(data.character);
            return;
          }
        }
      } else if (char.sourceId === 'chub') {
        const res = await fetch(`/api/chub/character/${encodeURIComponent(char.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.character) {
            setSelectedCharacter(data.character);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Could not load extra character details, showing card data:', e);
    }

    setSelectedCharacter(char);
  };

  const isJanny = activeSource === 'janny' || activeSource === 'janitor';

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex font-sans">
      {/* Primary Left Navigation Sidebar */}
      <div className={`${isSidebarOpenMobile ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden md:flex'}`}>
        <Sidebar
          activeSource={activeSource}
          onSelectSource={(source) => {
            setActiveSource(source);
            setError(null);
            setIsSidebarOpenMobile(false);
          }}
          savedCount={localLibrary.length}
          onOpenImport={() => {
            setIsImportModalOpen(true);
            setIsSidebarOpenMobile(false);
          }}
          onOpenSettings={() => {
            setIsSettingsModalOpen(true);
            setIsSidebarOpenMobile(false);
          }}
          onEnterHub={() => {
            handleEnterHub();
            setIsSidebarOpenMobile(false);
          }}
          safeMode={preferences.safeMode}
          onToggleSafeMode={() => handleUpdatePreferences({ safeMode: !preferences.safeMode })}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpenMobile && (
        <div
          onClick={() => setIsSidebarOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Body Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          activeSource={activeSource}
          onSelectSource={(source) => {
            setActiveSource(source);
            setError(null);
          }}
          libraryCount={localLibrary.length}
          onOpenImport={() => setIsImportModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onToggleSidebar={() => {
            // On desktop toggle collapse, on mobile toggle open
            if (window.innerWidth >= 768) {
              setIsSidebarCollapsed((prev) => !prev);
            } else {
              setIsSidebarOpenMobile((prev) => !prev);
            }
          }}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
        />

        {/* Main Content Area */}
        <main ref={mainContentRef} className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Source Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950 p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {activeSource === 'datacat' && <Database className="h-5 w-5 text-sky-400" />}
                  {isJanny && <Sparkles className="h-5 w-5 text-indigo-400" />}
                  {activeSource === 'chub' && <Compass className="h-5 w-5 text-emerald-400" />}
                  {activeSource === 'local' && <BookmarkCheck className="h-5 w-5 text-amber-400" />}
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {activeSource === 'datacat' && 'Datacat Character Index'}
                    {isJanny && 'Janny AI Community Library'}
                    {activeSource === 'chub' && 'Chub.ai Character Repository'}
                    {activeSource === 'local' && 'My Offline Character Library'}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                  {activeSource === 'datacat' &&
                    'Live Datacat search engine with authentic taxonomy facets, recovery state tracking, and full token weights breakdown.'}
                  {isJanny &&
                    'Live Janny AI archive mirror with authentic chat & message counts, proxy availability indicators, and Janny-style character profiles.'}
                  {activeSource === 'chub' &&
                    'Dedicated Chub card browser featuring star ratings, download statistics, Tavern V2 card definitions, and lorebook exports.'}
                  {activeSource === 'local' &&
                    'Your private collection of imported Tavern PNG cards and JSON cards, organized into custom spaces with zero telemetry.'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEnterHub}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:brightness-110 transition-all"
                  title="Enter Omni Hub"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Enter Hub</span>
                </button>
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
                Querying {activeSource === 'datacat' ? 'Datacat' : isJanny ? 'Janny AI' : activeSource === 'chub' ? 'Chub.ai' : 'Library'}...
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
                  : 'No characters returned for this category. Try switching filters or toggling Safe Mode.'}
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
                  : isJanny
                  ? jannyPage
                  : chubPage}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={
                    (activeSource === 'datacat' && datacatPage <= 1) ||
                    (isJanny && jannyPage <= 1) ||
                    (activeSource === 'chub' && chubPage <= 1)
                  }
                  onClick={() => {
                    if (activeSource === 'datacat') setDatacatPage((p) => Math.max(1, p - 1));
                    else if (isJanny) setJannyPage((p) => Math.max(1, p - 1));
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
                    else if (isJanny) setJannyPage((p) => p + 1);
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
      </div>

      {/* Source-Specific Character Profile Modals */}
      {selectedCharacter && (selectedCharacter.sourceId === 'janitor' || selectedCharacter.sourceId === 'janny') && (
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onResetPreferences={handleResetPreferences}
        onExportLibrary={handleExportLibrary}
        onClearCache={handleClearCache}
        savedCount={localLibrary.length}
      />

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
