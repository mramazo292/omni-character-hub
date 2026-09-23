import { CharacterItem } from '../types/character.ts';

const LIBRARY_KEY = 'omni_library_characters_v2';
const PREFERENCES_KEY = 'omni_preferences_v2';

export interface UserPreferences {
  density: 'comfortable' | 'compact';
  viewMode: 'grid' | 'list';
  pageSize: number;
  safeMode: boolean;
  activeSourceSpace: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  density: 'comfortable',
  viewMode: 'grid',
  pageSize: 24,
  safeMode: false,
  activeSourceSpace: 'All',
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

export function removeCharacterFromLibrary(id: string): void {
  const library = getLocalLibrary().filter((c) => c.id !== id);
  saveLocalLibrary(library);
}

export function toggleCharacterFavorite(id: string): boolean {
  const library = getLocalLibrary();
  const item = library.find((c) => c.id === id);
  if (!item) return false;

  if (!item.localMetadata) {
    item.localMetadata = {
      importedAt: new Date().toISOString(),
      originalFileName: 'card.json',
      sourceSpace: 'My Archive',
      isFavorite: true,
    };
  } else {
    item.localMetadata.isFavorite = !item.localMetadata.isFavorite;
  }

  saveLocalLibrary(library);
  return item.localMetadata.isFavorite;
}

export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function getUniqueSourceSpaces(library: CharacterItem[]): string[] {
  const spaces = new Set<string>();
  spaces.add('All');
  library.forEach((item) => {
    if (item.localMetadata?.sourceSpace) {
      spaces.add(item.localMetadata.sourceSpace);
    }
  });
  return Array.from(spaces);
}
