// --- NETWORK ENGINE (Routes via Lumiverse spindle.cors proxy) ---
async function httpGet(url, customHeaders = {}) {
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    ...customHeaders
  };

  // 1. Primary: Host CORS Proxy
  if (typeof spindle !== 'undefined' && typeof spindle.cors === 'function') {
    try {
      const res = await spindle.cors(url, { method: 'GET', headers });
      if (res && res.body) {
        return typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
      }
    } catch (e) {
      spindle.log?.warn?.(`spindle.cors GET failed for ${url}: ${e.message}`);
    }
  }

  // 2. Secondary Fallback: Native fetch
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return await res.json();
}

async function httpPost(url, body, customHeaders = {}) {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    ...customHeaders
  };

  if (typeof spindle !== 'undefined' && typeof spindle.cors === 'function') {
    try {
      const res = await spindle.cors(url, { method: 'POST', headers, body: bodyStr });
      if (res && res.body) {
        return typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
      }
    } catch (e) {
      spindle.log?.warn?.(`spindle.cors POST failed: ${e.message}`);
    }
  }

  const res = await fetch(url, { method: 'POST', headers, body: bodyStr });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return await res.json();
}

// --- PROVIDER: CHUB.AI ---
const Chub = {
  apiBase: 'https://api.chub.ai',
  avatarBase: 'https://avatars.charhub.io/avatars',

  async search({ query = '', page = 1, sort = 'download_count', nsfw = false, tag = '' }) {
    const term = [query, tag].filter(Boolean).join(' ');
    const params = new URLSearchParams({
      search: term,
      first: '20',
      page: String(page),
      sort: sort,
      venus: 'false',
      asc: 'false',
      nsfw: nsfw ? 'true' : 'false'
    });

    const data = await httpGet(`${this.apiBase}/search?${params}`);
    const nodes = data?.data?.nodes || data?.nodes || [];

    return {
      characters: nodes.map(c => ({
        id: c.fullPath,
        name: c.name || 'Unnamed',
        creator: c.fullPath ? c.fullPath.split('/')[0] : 'Unknown',
        avatarUrl: `${this.avatarBase}/${c.fullPath}/avatar.webp`,
        tagline: c.tagline || (c.description ? c.description.slice(0, 90) + '...' : ''),
        tags: (c.topics || []).filter(t => t && t !== 'ROOT').slice(0, 4),
        downloads: c.download_count || 0,
        stars: c.star_count || 0,
        source: 'chub'
      }))
    };
  },

  async fetchCard(fullPath) {
    const cardData = await httpPost(`${this.apiBase}/api/characters/download`, {
      fullPath,
      format: 'tavern'
    });

    return { card: cardData };
  }
};

// --- PROVIDER: JANNYAI (jannyai.com) ---
const JannyAI = {
  apiBase: 'https://api.jannyai.com/api/v1',

  extractId(input) {
    const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return match ? match[0] : input.trim();
  },

  async search({ query = '', page = 1 }) {
    try {
      const data = await httpGet(`${this.apiBase}/characters?search=${encodeURIComponent(query)}&page=${page}`);
      const items = data?.data || data?.characters || [];

      return {
        characters: items.map(c => ({
          id: c.id || c.characterId,
          name: c.name || 'Unnamed',
          creator: c.creator || c.author || 'JannyAI',
          avatarUrl: c.avatar || `https://image.jannyai.com/bot-avatars/${c.id}.webp`,
          tagline: c.description?.slice(0, 90) || '',
          tags: (c.tags || []).slice(0, 4),
          downloads: c.downloads || 0,
          stars: c.rating || 0,
          source: 'janny'
        }))
      };
    } catch {
      return { characters: [] };
    }
  },

  async fetchCard(idOrUrl) {
    const characterId = this.extractId(idOrUrl);
    const payload = await httpPost(`${this.apiBase}/download`, { characterId });

    if (!payload?.downloadUrl) throw new Error('Could not retrieve character file from JannyAI');
    const imageRes = await fetch(payload.downloadUrl);
    const pngBuffer = await imageRes.arrayBuffer();

    return { rawPngBuffer: pngBuffer };
  }
};

// --- PROVIDER: DATACAT (datacat.run) ---
const Datacat = {
  apiBase: 'https://datacat.run/api/client/v1',

  async search({ query = '', page = 1 }) {
    try {
      const url = query 
        ? `${this.apiBase}/characters?search=${encodeURIComponent(query)}&page=${page}`
        : `${this.apiBase}/fresh?page=${page}`;

      const data = await httpGet(url, { 'X-Datacat-Client-Id': 'datacat_client_v1' });
      const items = data?.characters || data?.items || [];

      return {
        characters: items.map(c => ({
          id: c.id,
          name: c.name || 'Unnamed',
          creator: c.creator?.name || 'Datacat',
          avatarUrl: `${this.apiBase}/characters/${c.id}/avatar`,
          tagline: c.summary || c.tagline || '',
          tags: (c.tags || []).slice(0, 4),
          downloads: c.kudos || 0,
          stars: 0,
          source: 'datacat'
        }))
      };
    } catch {
      return { characters: [] };
    }
  },

  async fetchCard(id) {
    const card = await httpGet(`${this.apiBase}/characters/${id}/card`, {
      'X-Datacat-Client-Id': 'datacat_client_v1'
    });
    return { card };
  }
};

// --- SPINDLE MESSAGE DISPATCHER ---
const providers = { chub: Chub, janny: JannyAI, datacat: Datacat };

spindle.onFrontendMessage(async (msg, userId) => {
  const { action, provider = 'chub', payload = {}, requestId } = msg || {};

  try {
    const current = providers[provider];
    if (!current) throw new Error(`Unknown provider: ${provider}`);

    if (action === 'SEARCH') {
      const results = await current.search(payload);
      spindle.sendToFrontend({ type: 'SEARCH_RESULT', requestId, results }, userId);
      return;
    }

    if (action === 'IMPORT') {
      const { id } = payload;
      const cardPayload = await current.fetchCard(id);
      let characterName = 'Character';

      if (cardPayload.rawPngBuffer) {
        // Direct Tavern PNG import
        const imported = await spindle.characters.importFile(cardPayload.rawPngBuffer);
        characterName = imported?.name || characterName;
      } else {
        // Lumiverse CharacterCreateDTO format
        const raw = cardPayload.card?.data || cardPayload.card || {};
        const charDto = {
          name: raw.name || 'Imported Character',
          description: raw.description || '',
          personality: raw.personality || '',
          scenario: raw.scenario || '',
          first_mes: raw.first_mes || '',
          mes_example: raw.mes_example || '',
          creator_notes: raw.creator_notes || '',
          system_prompt: raw.system_prompt || '',
          post_history_instructions: raw.post_history_instructions || '',
          tags: Array.isArray(raw.tags) ? raw.tags : (Array.isArray(raw.topics) ? raw.topics : []),
          alternate_greetings: Array.isArray(raw.alternate_greetings) ? raw.alternate_greetings : [],
          creator: raw.creator || 'Community'
        };

        const imported = await spindle.characters.create(charDto);
        characterName = imported?.name || charDto.name;
      }

      spindle.sendToFrontend({ type: 'IMPORT_SUCCESS', requestId, characterName }, userId);
    }
  } catch (err) {
    spindle.sendToFrontend({
      type: 'ERROR',
      requestId,
      error: err.message || 'Operation failed'
    }, userId);
  }
});
