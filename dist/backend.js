// --- LUMIVERSE SPINDLE BACKEND ENGINE ---
async function httpFetch(url, options = {}) {
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    ...(options.headers || {})
  };

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
      spindle.log?.warn?.(`spindle.cors notice: ${e.message}`);
    }
  }

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

function approxTokens(str) {
  if (!str) return 0;
  return Math.round(str.length / 3.8);
}

const Chub = {
  apiBase: 'https://api.chub.ai',
  avatarBase: 'https://avatars.charhub.io/avatars',

  async search({ query = '', page = 1, sort = 'download_count', nsfw = true, tag = '' }) {
    const params = new URLSearchParams({
      search: query,
      first: '24',
      page: String(page),
      sort: sort,
      venus: 'false',
      asc: 'false',
      nsfw: nsfw ? 'true' : 'false'
    });
    if (tag) params.append('topics', tag);

    try {
      const data = await httpFetch(`${this.apiBase}/search?${params}`);
      const nodes = data?.data?.nodes || data?.nodes || [];
      if (nodes.length > 0) {
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
            tokens: c.token_count || 0,
            source: 'chub'
          }))
        };
      }
    } catch {}

    // Fallback search
    const localRes = await fetch(`http://localhost:3000/api/chub/characters?search=${encodeURIComponent(query)}&sort=${encodeURIComponent(sort)}&tag=${encodeURIComponent(tag)}&nsfw=${nsfw}`);
    return await localRes.json();
  },

  async getDetails(fullPath) {
    const localRes = await fetch(`http://localhost:3000/api/chub/character/${encodeURIComponent(fullPath)}`);
    const data = await localRes.json();
    return data.character;
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

const JannyAI = {
  async search({ query = '', page = 1, sort = 'recent', tag = '', nsfw = true }) {
    const res = await fetch(`http://localhost:3000/api/janny/characters?search=${encodeURIComponent(query)}&sort=${encodeURIComponent(sort)}&tagId=${encodeURIComponent(tag)}&nsfw=${nsfw}`);
    return await res.json();
  },
  async getDetails(id) {
    const res = await fetch(`http://localhost:3000/api/janny/character/${encodeURIComponent(id)}`);
    const data = await res.json();
    return data.character;
  },
  async fetchCard(id) {
    const res = await fetch(`http://localhost:3000/api/janny/character/${encodeURIComponent(id)}`);
    const data = await res.json();
    return { card: data.character };
  }
};

const Datacat = {
  async search({ query = '', page = 1, sort = 'recent', tag = '', nsfw = true }) {
    const res = await fetch(`http://localhost:3000/api/datacat/characters?search=${encodeURIComponent(query)}&sort=${encodeURIComponent(sort)}&tagIds=${encodeURIComponent(tag)}&nsfw=${nsfw}`);
    return await res.json();
  },
  async getDetails(id) {
    const res = await fetch(`http://localhost:3000/api/datacat/character/${encodeURIComponent(id)}`);
    const data = await res.json();
    return data.character;
  },
  async fetchCard(id) {
    const res = await fetch(`http://localhost:3000/api/datacat/character/${encodeURIComponent(id)}`);
    const data = await res.json();
    return { card: data.character };
  }
};

const providers = { chub: Chub, janny: JannyAI, datacat: Datacat };

if (typeof spindle !== 'undefined' && spindle.onFrontendMessage) {
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
}
