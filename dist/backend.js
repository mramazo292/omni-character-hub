// --- UNIFIED RESILIENT NETWORK ENGINE ---
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

// ==========================================
// 1. CHUB.AI PROVIDER (Native Chub API)
// ==========================================
const Chub = {
  apiBase: 'https://api.chub.ai',
  avatarBase: 'https://avatars.charhub.io/avatars',

  async search({ query = '', page = 1, sort = 'download_count', nsfw = false, tag = '' }) {
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

    const data = await httpFetch(`${this.apiBase}/search?${params}`);
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
        tokens: c.token_count || 0,
        source: 'chub'
      }))
    };
  },

  async getDetails(fullPath) {
    const res = await httpFetch(`${this.apiBase}/api/characters/${fullPath}?full=true`);
    const node = res?.node || res || {};

    let cardData = {};
    try {
      cardData = await httpFetch(`${this.apiBase}/api/characters/download`, {
        method: 'POST',
        body: JSON.stringify({ fullPath, format: 'tavern' }),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      cardData = node.definition || {};
    }

    const d = cardData?.data || cardData || {};
    const ext = d.extensions || {};
    const charDesc = d.description || '';
    const charPers = d.personality || node.personality || '';
    const charFirstMes = d.first_mes || node.first_mes || '';

    return {
      id: fullPath,
      name: d.name || node.name || 'Unnamed',
      creator: fullPath.split('/')[0] || 'Unknown',
      avatarUrl: `${this.avatarBase}/${fullPath}/avatar.webp`,
      webSummary: node.description || node.tagline || 'No catalog summary provided.',
      charDescription: charDesc || 'No character prompt definition found.',
      personality: charPers || 'No personality definition visible.',
      scenario: d.scenario || node.scenario || 'No scenario defined.',
      first_mes: charFirstMes || 'Hello!',
      alternate_greetings: Array.isArray(d.alternate_greetings) ? d.alternate_greetings : [],
      creator_notes: d.creator_notes || ext.creator_notes || '',
      system_prompt: d.system_prompt || '',
      mes_example: d.mes_example || '',
      tags: (node.topics || d.tags || []).filter(t => t && t !== 'ROOT'),
      downloads: node.download_count || 0,
      stars: node.star_count || 0,
      totalTokens: node.token_count || approxTokens(charDesc + charPers + charFirstMes),
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

// ==========================================
// 2. JANITOR AI PROVIDER (Native Hampter API)
// ==========================================
const JanitorAI = {
  janitorApi: 'https://janitorai.com',
  jannyDownload: 'https://api.jannyai.com/api/v1/download',

  extractId(input) {
    const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return match ? match[0] : input.trim();
  },

  async search({ query = '', page = 1, sort = 'trending', tag = '', nsfw = false }) {
    let sortParam = sort === 'popular' ? 'popular' : (sort === 'recent' ? 'latest' : 'trending');
    const params = new URLSearchParams({
      page: String(page),
      sort: sortParam,
      search: query,
      nsfw: nsfw ? 'true' : 'false'
    });
    if (tag) params.append('tags', tag);

    try {
      const data = await httpFetch(`${this.janitorApi}/hampter/characters?${params}`);
      const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

      if (items.length > 0) {
        return {
          characters: items.map(c => ({
            id: c.id,
            name: c.name || 'Unnamed',
            creator: c.creator_name || c.author || 'Janitor Creator',
            avatarUrl: c.avatar?.startsWith('http') ? c.avatar : `https://ella.janitorai.com/bot-avatars/${c.avatar}`,
            tagline: c.description || c.personality?.slice(0, 90) || '',
            tags: Array.isArray(c.tags) ? c.tags.slice(0, 4) : ['JanitorAI'],
            downloads: c.stats?.chat || c.chat_count || 0,
            stars: c.stats?.favorite || 0,
            tokens: c.tokens || 0,
            source: 'janitor'
          }))
        };
      }
    } catch (e) {
      spindle.log?.warn?.(`Janitor Hampter fetch error: ${e.message}`);
    }

    return { characters: [] };
  },

  async getDetails(idOrUrl) {
    const uuid = this.extractId(idOrUrl);
    try {
      const data = await httpFetch(`${this.janitorApi}/hampter/characters/${uuid}`);
      const c = data?.character || data || {};

      return {
        id: uuid,
        name: c.name || 'Janitor Character',
        creator: c.creator_name || 'Janitor Creator',
        avatarUrl: c.avatar?.startsWith('http') ? c.avatar : `https://ella.janitorai.com/bot-avatars/${c.avatar}`,
        webSummary: c.description || 'Janitor character definition.',
        charDescription: c.personality || c.description || 'Definition encoded in card.',
        personality: c.personality || 'Defined in card file.',
        scenario: c.scenario || 'Scenario included in prompt.',
        first_mes: c.first_message || 'Ready for chat.',
        alternate_greetings: Array.isArray(c.first_messages) ? c.first_messages : [],
        creator_notes: c.creator_notes || '',
        system_prompt: '',
        mes_example: c.example_dialogs || '',
        tags: Array.isArray(c.tags) ? c.tags : ['JanitorAI'],
        downloads: c.stats?.chat || 0,
        stars: c.stats?.favorite || 0,
        totalTokens: c.tokens || approxTokens((c.personality || '') + (c.first_message || '')),
        source: 'janitor'
      };
    } catch {
      return {
        id: uuid,
        name: 'Janitor Character',
        creator: 'JanitorAI',
        avatarUrl: `https://image.jannyai.com/bot-avatars/${uuid}.webp`,
        webSummary: 'Full character card ready for import.',
        charDescription: 'All prompts will be extracted directly from card file.',
        personality: 'Defined in card file.',
        scenario: 'Available after import.',
        first_mes: 'Ready for chat.',
        alternate_greetings: [],
        creator_notes: '',
        system_prompt: '',
        mes_example: '',
        tags: ['JanitorAI'],
        downloads: 0,
        stars: 0,
        totalTokens: 0,
        source: 'janitor'
      };
    }
  },

  async fetchCard(idOrUrl) {
    const uuid = this.extractId(idOrUrl);
    const res = await httpFetch(this.jannyDownload, {
      method: 'POST',
      body: JSON.stringify({ characterId: uuid }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res?.downloadUrl) throw new Error('Could not download card from Janitor proxy. Verify character UUID.');
    const imgRes = await fetch(res.downloadUrl);
    const pngBuffer = await imgRes.arrayBuffer();
    return { rawPngBuffer: pngBuffer };
  }
};

// ==========================================
// 3. DATACAT PROVIDER (Official Client API)
// ==========================================
const Datacat = {
  apiBase: 'https://datacat.run',

  async search({ query = '', page = 1, sort = 'fresh', tag = '' }) {
    const term = [query, tag].filter(Boolean).join(' ');
    const endpoint = term
      ? `${this.apiBase}/api/client/v1/characters?search=${encodeURIComponent(term)}&page=${page}`
      : `${this.apiBase}/api/client/v1/fresh?page=${page}`;

    const data = await httpFetch(endpoint, {
      headers: { 'X-Datacat-Client-Id': 'datacat_client_v1', 'Accept': 'application/json' }
    });

    const items = Array.isArray(data) ? data : (data?.characters || data?.items || data?.nodes || data?.data || []);

    return {
      characters: items.map(c => ({
        id: c.id,
        name: c.name || 'Unnamed',
        creator: c.creator?.name || c.creator || 'Datacat Creator',
        avatarUrl: `${this.apiBase}/api/client/v1/characters/${c.id}/avatar`,
        tagline: c.summary || c.tagline || (c.description ? c.description.slice(0, 90) + '...' : ''),
        tags: Array.isArray(c.tags) ? c.tags.slice(0, 4) : ['Datacat'],
        downloads: c.kudos || c.downloads || 0,
        stars: 0,
        tokens: c.token_count || 0,
        source: 'datacat'
      }))
    };
  },

  async getDetails(id) {
    const card = await httpFetch(`${this.apiBase}/api/client/v1/characters/${id}/card`, {
      headers: { 'X-Datacat-Client-Id': 'datacat_client_v1' }
    });
    const d = card?.data || card || {};

    return {
      id,
      name: d.name || 'Datacat Character',
      creator: d.creator || 'Datacat',
      avatarUrl: `${this.apiBase}/api/client/v1/characters/${id}/avatar`,
      webSummary: d.creator_notes || d.description?.slice(0, 140) || 'Datacat character definition.',
      charDescription: d.description || 'Prompt definition encoded in card.',
      personality: d.personality || 'Standard personality traits.',
      scenario: d.scenario || 'No scenario defined.',
      first_mes: d.first_mes || 'Ready for chat.',
      alternate_greetings: Array.isArray(d.alternate_greetings) ? d.alternate_greetings : [],
      creator_notes: d.creator_notes || '',
      system_prompt: d.system_prompt || '',
      mes_example: d.mes_example || '',
      tags: d.tags || ['Datacat'],
      downloads: 0,
      stars: 0,
      totalTokens: approxTokens((d.description || '') + (d.personality || '') + (d.first_mes || '')),
      source: 'datacat'
    };
  },

  async fetchCard(id) {
    const card = await httpFetch(`${this.apiBase}/api/client/v1/characters/${id}/card`, {
      headers: { 'X-Datacat-Client-Id': 'datacat_client_v1' }
    });
    return { card };
  }
};

// --- IPC ROUTER ---
const providers = { chub: Chub, janny: JanitorAI, datacat: Datacat };

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
