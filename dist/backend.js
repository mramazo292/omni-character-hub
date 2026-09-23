const EXTENSION_ID = 'omni_character_hub';
const SETTINGS_KEY = 'settings.v2';
const SOURCES_KEY = 'sources.v2';

const DEFAULT_SETTINGS = {
  theme: 'auto',
  density: 'comfortable',
  view: 'grid',
  columns: 3,
  showTags: true,
  showStats: true,
  defaultSort: 'updated',
  pageSize: 30,
  tagMode: 'AND',
  favoriteFirst: false
};

const DEFAULT_SOURCES = [
  {
    id: 'local',
    name: 'Local Cards',
    kind: 'local',
    enabled: true,
    description: 'Character cards you import from your device.',
    accent: '#7c5cff'
  }
];

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function storageGet(key, fallback) {
  const s = spindle?.userStorage;
  if (!s) return fallback;
  for (const method of ['get', 'read']) {
    try {
      if (typeof s[method] !== 'function') continue;
      const value = await s[method](key);
      if (value !== undefined && value !== null) return value;
    } catch {}
  }
  return fallback;
}

async function storageSet(key, value) {
  const s = spindle?.userStorage;
  if (!s) return false;
  for (const method of ['set', 'write']) {
    try {
      if (typeof s[method] !== 'function') continue;
      await s[method](key, value);
      return true;
    } catch {}
  }
  return false;
}

async function getSettings() {
  const saved = await storageGet(SETTINGS_KEY, {});
  return { ...DEFAULT_SETTINGS, ...(saved && typeof saved === 'object' ? saved : {}) };
}

async function saveSettings(patch) {
  const next = { ...(await getSettings()), ...(patch || {}) };
  await storageSet(SETTINGS_KEY, next);
  return next;
}

async function getSources() {
  const saved = await storageGet(SOURCES_KEY, null);
  if (!Array.isArray(saved) || !saved.length) {
    await storageSet(SOURCES_KEY, DEFAULT_SOURCES);
    return deepClone(DEFAULT_SOURCES);
  }
  return saved.map(normalizeSource);
}

function normalizeSource(source) {
  const id = String(source?.id || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').slice(0, 48);
  return {
    id: id || `source_${Date.now().toString(36)}`,
    name: String(source?.name || 'Unnamed Source').trim().slice(0, 80),
    kind: source?.kind === 'local' ? 'local' : 'custom',
    enabled: source?.enabled !== false,
    description: String(source?.description || '').slice(0, 200),
    accent: String(source?.accent || '#7c5cff').slice(0, 20),
    homepage: String(source?.homepage || '').slice(0, 300),
    notes: String(source?.notes || '').slice(0, 500)
  };
}

async function saveSources(sources) {
  const unique = [];
  const seen = new Set();
  for (const source of Array.isArray(sources) ? sources : []) {
    const s = normalizeSource(source);
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    unique.push(s);
  }
  if (!unique.some(s => s.id === 'local')) unique.unshift(DEFAULT_SOURCES[0]);
  await storageSet(SOURCES_KEY, unique);
  return unique;
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function stringArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(cleanString).filter(Boolean))].slice(0, 80);
}

function looksExplicit(card) {
  // Conservative metadata-only gate. We do not inspect prompt prose or search for
  // mature keywords; explicit imports are simply skipped when the card declares
  // an adult/NSFW/mature boolean field.
  const flags = [
    card?.nsfw, card?.adult, card?.mature, card?.is_nsfw,
    card?.extensions?.nsfw, card?.extensions?.adult, card?.extensions?.mature,
    card?.data?.nsfw, card?.data?.adult, card?.data?.mature
  ];
  return flags.some(v => v === true || String(v).toLowerCase() === 'true');
}

function normalizeCard(raw, sourceLabel='Local Cards') {
  const root = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
  const extensions = root?.extensions && typeof root.extensions === 'object' ? root.extensions : {};
  return {
    name: cleanString(root?.name) || 'Imported Character',
    description: cleanString(root?.description),
    personality: cleanString(root?.personality),
    scenario: cleanString(root?.scenario),
    first_mes: cleanString(root?.first_mes),
    mes_example: cleanString(root?.mes_example),
    creator_notes: cleanString(root?.creator_notes),
    system_prompt: cleanString(root?.system_prompt),
    post_history_instructions: cleanString(root?.post_history_instructions),
    tags: stringArray(root?.tags || root?.topics),
    alternate_greetings: stringArray(root?.alternate_greetings),
    creator: cleanString(root?.creator) || 'Community',
    extensions: {
      [EXTENSION_ID]: {
        imported_source: sourceLabel,
        imported_at: Math.floor(Date.now() / 1000),
        original_card_version: root?.spec_version || root?.spec || 'unknown'
      },
      source: extensions.source
    }
  };
}

function toSummary(char) {
  const ext = char?.extensions?.[EXTENSION_ID] || {};
  const tags = Array.isArray(char?.tags) ? char.tags : [];
  return {
    id: char.id,
    name: char.name || 'Unnamed',
    creator: char.creator || 'Community',
    description: char.description || '',
    tags,
    sourceId: String(ext.imported_source_id || 'local'),
    sourceName: String(ext.imported_source || 'Local Cards'),
    createdAt: char.created_at || 0,
    updatedAt: char.updated_at || char.created_at || 0,
    alternateGreetings: Array.isArray(char.alternate_greetings) ? char.alternate_greetings.length : 0
  };
}

function matchesQuery(item, query) {
  if (!query) return true;
  const hay = [
    item.name, item.creator, item.description, ...(item.tags || []), item.sourceName
  ].join(' ').toLowerCase();
  return hay.includes(query.toLowerCase());
}

function matchesTags(item, tags, mode) {
  if (!tags?.length) return true;
  const normalized = new Set((item.tags || []).map(t => t.toLowerCase()));
  const checks = tags.map(t => normalized.has(String(t).toLowerCase()));
  return mode === 'OR' ? checks.some(Boolean) : checks.every(Boolean);
}

function sortItems(items, sort, favoriteFirst) {
  const arr = [...items];
  if (favoriteFirst) {
    arr.sort((a,b) => Number(b._favorite) - Number(a._favorite));
  }
  arr.sort((a,b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'creator') return a.creator.localeCompare(b.creator);
    if (sort === 'created') return Number(b.createdAt) - Number(a.createdAt);
    return Number(b.updatedAt) - Number(a.updatedAt);
  });
  return arr;
}

async function listLibrary(payload={}) {
  const { data } = await spindle.characters.list({ limit: 200, offset: 0 });
  const all = (Array.isArray(data) ? data : []).map(toSummary);

  const sources = await getSources();
  const favorites = new Set((await storageGet('favorites.v2', []) || []).map(String));

  let items = all.map(item => ({ ...item, _favorite: favorites.has(String(item.id)) }));
  const sourceId = cleanString(payload.sourceId);
  if (sourceId) items = items.filter(item => item.sourceId === sourceId);
  if (payload.query) items = items.filter(item => matchesQuery(item, payload.query));
  items = items.filter(item => matchesTags(item, payload.tags || [], payload.tagMode || 'AND'));

  const filtered = sortItems(items, payload.sort || (await getSettings()).defaultSort, payload.favoriteFirst);
  const pageSize = Math.max(1, Math.min(100, Number(payload.pageSize || 30)));
  const page = Math.max(1, Number(payload.page || 1));
  const start = (page - 1) * pageSize;

  const tagCounts = {};
  for (const item of filtered) for (const tag of item.tags || []) {
    const key = String(tag);
    tagCounts[key] = (tagCounts[key] || 0) + 1;
  }

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    hasNext: start + pageSize < filtered.length,
    sources: sources.filter(s => s.enabled),
    facets: Object.entries(tagCounts)
      .map(([tag,count]) => ({ tag, count }))
      .sort((a,b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, 80)
  };
}

async function getCharacter(id) {
  const char = await spindle.characters.get(String(id));
  if (!char) throw new Error('Character no longer exists in the library.');
  const sourceInfo = char.extensions?.[EXTENSION_ID] || {};
  return {
    ...char,
    sourceInfo
  };
}

async function setFavorite(id, favorite) {
  const current = new Set((await storageGet('favorites.v2', []) || []).map(String));
  if (favorite) current.add(String(id)); else current.delete(String(id));
  await storageSet('favorites.v2', [...current]);
  return [...current];
}

async function ensureSource(sourceId, sourceName) {
  const sources = await getSources();
  const id = String(sourceId || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').slice(0, 48) || 'local';
  const name = String(sourceName || 'Local Cards').trim().slice(0, 80) || 'Local Cards';
  if (!sources.some(s => s.id === id)) {
    sources.push({
      id,
      name,
      kind: id === 'local' ? 'local' : 'custom',
      enabled: true,
      description: id === 'local' ? 'Character cards imported from your device.' : `Imported cards grouped under ${name}.`,
      accent: id === 'local' ? '#7c5cff' : '#2fd39a'
    });
    await saveSources(sources);
  }
  return id;
}

async function importCardData(raw, sourceLabel='Local Cards', sourceId='local', originalName='') {
  if (!raw || typeof raw !== 'object') throw new Error('The selected card is not valid JSON.');
  const cardRoot = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
  if (looksExplicit(raw) || looksExplicit(cardRoot)) {
    throw new Error('This extension only imports cards that do not declare mature/adult content in their metadata.');
  }

  sourceId = await ensureSource(sourceId, sourceLabel);
  const card = normalizeCard(cardRoot, sourceLabel);
  card.extensions[EXTENSION_ID] = {
    imported_source: sourceLabel,
    imported_source_id: sourceId,
    imported_at: Math.floor(Date.now() / 1000),
    original_name: originalName || card.name
  };

  const imported = await spindle.characters.create(card);
  return { character: imported, characterName: imported?.name || card.name };
}

function bytesFromBase64(base64) {
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i=0; i<bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

spindle.onFrontendMessage(async (msg, userId) => {
  const { action, payload = {}, requestId } = msg || {};
  try {
    let result;

    switch (action) {
      case 'BOOT':
        result = { settings: await getSettings(), sources: await getSources() };
        break;

      case 'SAVE_SETTINGS':
        result = { settings: await saveSettings(payload) };
        break;

      case 'SAVE_SOURCES':
        result = { sources: await saveSources(payload.sources) };
        break;

      case 'LIST_LIBRARY':
        result = await listLibrary(payload);
        break;

      case 'GET_CHARACTER':
        result = { character: await getCharacter(payload.id) };
        break;

      case 'SET_FAVORITE':
        result = { favorites: await setFavorite(payload.id, Boolean(payload.favorite)) };
        break;

      case 'IMPORT_JSON':
        result = await importCardData(payload.card, payload.sourceName || 'Local Cards', payload.sourceId || 'local', payload.fileName || '');
        break;

      case 'IMPORT_FILE_BASE64': {
        const sourceName = payload.sourceName || 'Local Cards';
        const sourceId = await ensureSource(
          payload.sourceId || String(sourceName).toLowerCase().replace(/[^a-z0-9_-]+/g, '_').slice(0, 48) || 'local',
          sourceName
        );
        const bytes = bytesFromBase64(String(payload.base64 || ''));
        const imported = await spindle.characters.importFile(bytes.buffer);
        const importedId = imported?.id;
        if (importedId && spindle.characters.update) {
          try {
            await spindle.characters.update(importedId, {
              extensions: {
                [EXTENSION_ID]: {
                  imported_source: sourceName,
                  imported_source_id: sourceId,
                  imported_at: Math.floor(Date.now() / 1000),
                  original_file: payload.fileName || ''
                }
              }
            });
          } catch {}
        }
        result = { character: imported, characterName: imported?.name || payload.fileName || 'Imported Character' };
        break;
      }

      case 'DELETE_CHARACTER':
        result = { deleted: await spindle.characters.delete(String(payload.id)) };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    spindle.sendToFrontend({ type: 'OK', requestId, result }, userId);
  } catch (err) {
    spindle.sendToFrontend({
      type: 'ERROR',
      requestId,
      error: err?.message || 'Operation failed'
    }, userId);
  }
});
