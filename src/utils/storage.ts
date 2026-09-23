import { CharacterItem } from '../types/character.ts';

const LIBRARY_KEY = 'omni_library_characters_v2';
const PREFERENCES_KEY = 'omni_preferences_v2';

export interface UserPreferences {
  density: 'comfortable' | 'compact';
  viewMode: 'grid' | 'list';
  pageSize: number;
  safeMode: boolean;
  nsfw: boolean; // Explicit NSFW setting, toggled ON by default
  activeSourceSpace: string;
  lumiverseDrawerOpen?: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  density: 'comfortable',
  viewMode: 'grid',
  pageSize: 24,
  safeMode: false,
  nsfw: true, // TOGGLED ON BY DEFAULT as requested
  activeSourceSpace: 'All',
  lumiverseDrawerOpen: false,
};

export function getLocalLibrary(): CharacterItem[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load local library:', err);
    return [];
  }
}

export function saveLocalLibrary(items: CharacterItem[]): void {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save local library:', err);
  }
}

export function addCharacterToLibrary(
  character: CharacterItem,
  sourceSpace = 'My Archive'
): CharacterItem {
  const library = getLocalLibrary();
  const existingIdx = library.findIndex((c) => c.id === character.id);

  const localItem: CharacterItem = {
    ...character,
    sourceId: 'local',
    sourceName: 'My Library',
    localMetadata: {
      importedAt: new Date().toISOString(),
      originalFileName: `${character.name}.json`,
      sourceSpace,
      isFavorite: false,
      ...(character.localMetadata || {}),
    },
  };

  if (existingIdx >= 0) {
    library[existingIdx] = localItem;
  } else {
    library.unshift(localItem);
  }

  saveLocalLibrary(library);
  return localItem;
}

export function removeCharacterFromLibrary(id: string): CharacterItem[] {
  const library = getLocalLibrary().filter((c) => c.id !== id);
  saveLocalLibrary(library);
  return library;
}

export function toggleCharacterFavorite(id: string): CharacterItem[] {
  const library = getLocalLibrary().map((c) => {
    if (c.id === id && c.localMetadata) {
      return {
        ...c,
        localMetadata: {
          ...c.localMetadata,
          isFavorite: !c.localMetadata.isFavorite,
        },
      };
    }
    return c;
  });
  saveLocalLibrary(library);
  return library;
}

export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      // Ensure NSFW is enabled by default if not explicitly set to false
      nsfw: parsed.nsfw !== undefined ? Boolean(parsed.nsfw) : true,
      safeMode: parsed.nsfw !== undefined ? !parsed.nsfw : false,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(
  prefs: Partial<UserPreferences>
): UserPreferences {
  const current = getUserPreferences();
  // Keep nsfw and safeMode in sync (nsfw = !safeMode)
  let nsfw = current.nsfw;
  let safeMode = current.safeMode;

  if (prefs.nsfw !== undefined) {
    nsfw = Boolean(prefs.nsfw);
    safeMode = !nsfw;
  } else if (prefs.safeMode !== undefined) {
    safeMode = Boolean(prefs.safeMode);
    nsfw = !safeMode;
  }

  const updated: UserPreferences = {
    ...current,
    ...prefs,
    nsfw,
    safeMode,
  };
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save preferences:', err);
  }
  return updated;
}

export function getUniqueSourceSpaces(items: CharacterItem[]): string[] {
  const spaces = new Set<string>(['All']);
  items.forEach((item) => {
    if (item.localMetadata?.sourceSpace) {
      spaces.add(item.localMetadata.sourceSpace);
    }
  });
  return Array.from(spaces);
}
