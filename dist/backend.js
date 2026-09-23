// --- UNIFIED RESILIENT NETWORK ENGINE ---
async function httpFetch(url, options = {}) {
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    ...(options.headers || {})
  };

  // Try host spindle.cors proxy first
  if (typeof spindle !== 'undefined' && typeof spindle.cors === 'function') {
    try {
      const res = await spindle.cors(url, { ...options, headers });
      if (res && res.body) {
        if (typeof res.body === 'string') {
          try { return JSON.parse(res.body); } catch { return res.body; }
        }
        return res.body;
      }
    } catch (e) {
      spindle.log?.warn?.(`spindle.cors fallback: ${e.message}`);
    }
  }

  // Native fetch fallback
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
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

    const data = await httpFetch(`${this.apiBase}/search?${params}`);
    const nodes = data?.data?.nodes || data?.nodes || [];

    return {
      characters: nodes.map(c => ({
        id: c.fullPath,
        name: c.name || 'Unnamed',
        creator: c.fullPath ? c.fullPath.split('/')[0] : 'Unknown',
        avatarUrl: `${this.avatarBase}/${c.fullPath}/avatar.webp`,
        tagline: c.tagline || (c.description ? c.description.slice(0, 95) + '...' : ''),
        tags: (c.topics || []).filter(t => t && t !== 'ROOT').slice(0, 5),
        downloads: c.download_count || 0,
        stars: c.star_count || 0,
        source: 'chub'
      }))
    };
  },

  async getDetails(fullPath) {
    const res = await httpFetch(`${this.apiBase}/api/characters/${fullPath}?full=true`);
    const c = res?.node || res || {};
    return {
      id: fullPath,
      name: c.name || 'Unnamed',
      creator: fullPath.split('/')[0] || 'Unknown',
      avatarUrl: `${this.avatarBase}/${fullPath}/avatar.webp`,
      description: c.description || 'No description available.',
      personality: c.personality || 'No personality definition visible.',
      scenario: c.scenario || 'No scenario defined.',
      first_mes: c.first_mes || 'Hello! (Default greeting)',
      tags: (c.topics || []).filter(t => t && t !== 'ROOT'),
      downloads: c.download_count || 0,
      stars: c.star_count || 0,
      tokens: c.token_count || 0,
      source: 'chub'
    };
  },

  async fetchCard(fullPath) {
    const cardData = await httpFetch(`${this.apiBase}/api/characters/download`, {
      method: 'POST',
      body: JSON.stringify({ fullPath, format: 'tavern' }),
      headers: { 'Content-Type': 'application/json' }
    });
    return { card: cardData };
  }
};

// --- PROVIDER: DATACAT (datacat.run) ---
const Datacat = {
  apiBase: 'https://datacat.run/api/client/v1',

  async search({ query = '', page = 1 }) {
    try {
      // anonymous=1 grants access without private API keys
      const endpoint = query
        ? `${this.apiBase}/characters?search=${encodeURIComponent(query)}&page=${page}&anonymous=1`
        : `${this.apiBase}/fresh?page=${page}&anonymous=1`;

      const data = await httpFetch(endpoint);
      const items = data?.characters || data?.items || [];

      return {
        characters: items.map(c => ({
          id: c.id,
          name: c.name || 'Unnamed',
          creator: c.creator?.name || 'Datacat Creator',
          avatarUrl: `${this.apiBase}/characters/${c.id}/avatar?anonymous=1`,
          tagline: c.summary || c.tagline || 'Datacat Character Card',
          tags: (c.tags || []).slice(0, 5),
          downloads: c.kudos || 0,
          stars: 0,
          source: 'datacat'
        }))
      };
    } catch {
      return { characters: [] };
    }
  },

  async getDetails(id) {
    const card = await httpFetch(`${this.apiBase}/characters/${id}/card?anonymous=1`);
    const c = card?.data || card || {};
    return {
      id,
      name: c.name || 'Datacat Character',
      creator: c.creator || 'Datacat',
      avatarUrl: `${this.apiBase}/characters/${id}/avatar?anonymous=1`,
      description: c.description || 'No description.',
      personality: c.personality || 'Standard personality.',
      scenario: c.scenario || '',
      first_mes: c.first_mes || '',
      tags: c.tags || [],
      downloads: 0,
      stars: 0,
      tokens: 0,
      source: 'datacat'
    };
  },

  async fetchCard(id) {
    const card = await httpFetch(`${this.apiBase}/characters/${id}/card?anonymous=1`);
    return { card };
  }
};

// --- PROVIDER: JANNYAI (jannyai.com) ---
const JannyAI = {
  avatarBase: 'https://image.jannyai.com/bot-avatars',

  extractId(input) {
    const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return match ? match[0] : input.trim();
  },

  async search({ query = '', page = 1 }) {
    try {
      const url = `https://api.jannyai.com/api/v1/characters?search=${encodeURIComponent(query)}&page=${page}`;
      const data = await httpFetch(url);
      const items = data?.data || data?.characters || [];

      return {
        characters: items.map(c => ({
          id: c.id || c.characterId,
          name: c.name || 'Unnamed',
          creator: c.creator || c.author || 'JannyAI',
          avatarUrl: c.avatar || `${this.avatarBase}/${c.id}.webp`,
          tagline: c.description ? c.description.slice(0, 95) + '...' : 'JannyAI Character',
          tags: (c.tags || []).slice(0, 5),
          downloads: c.downloads || 0,
          stars: c.rating || 0,
          source: 'janny'
        }))
      };
    } catch {
      return { characters: [] };
    }
  },

  async getDetails(idOrUrl) {
    const id = this.extractId(idOrUrl);
    // Fetch details
    return {
      id,
      name: 'JannyAI Character',
      creator: 'JannyAI',
      avatarUrl: `${this.avatarBase}/${id}.webp`,
      description: 'Ready to import. Click below to download the full character definition.',
      personality: 'Defined in card file.',
      scenario: '',
      first_mes: 'Character card ready for download.',
      tags: ['JannyAI'],
      downloads: 0,
      stars: 0,
      tokens: 0,
      source: 'janny'
    };
  },

  async fetchCard(idOrUrl) {
    const characterId = this.extractId(idOrUrl);
    const res = await httpFetch('https://api.jannyai.com/api/v1/download', {
      method: 'POST',
      body: JSON.stringify({ characterId }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res?.downloadUrl) throw new Error('Could not download from JannyAI. Ensure URL is valid.');
    const imageRes = await fetch(res.downloadUrl);
    const pngBuffer = await imageRes.arrayBuffer();

    return { rawPngBuffer: pngBuffer };
  }
};

// --- IPC BRIDGE ---
const providers = { chub: Chub, datacat: Datacat, janny: JannyAI };

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

    if (action === 'GET_DETAILS') {
      const details = await current.getDetails(payload.id);
      spindle.sendToFrontend({ type: 'DETAILS_RESULT', requestId, details }, userId);
      return;
    }

    if (action === 'IMPORT') {
      const { id } = payload;
      const cardPayload = await current.fetchCard(id);
      let characterName = 'Character';

      if (cardPayload.rawPngBuffer) {
        const imported = await spindle.characters.importFile(cardPayload.rawPngBuffer);
        characterName = imported?.name || characterName;
      } else {
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
