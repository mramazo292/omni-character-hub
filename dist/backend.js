// --- NETWORK ENGINE (Routes through Lumiverse spindle.cors proxy) ---
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
      spindle.log?.warn?.(`spindle.cors proxy notice: ${e.message}`);
    }
  }

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

// --- PROVIDER: CHUB.AI ---
const Chub = {
  apiBase: 'https://api.chub.ai',
  avatarBase: 'https://avatars.charhub.io/avatars',

  async search({ query = '', page = 1, sort = 'download_count', asc = false, nsfw = false, tag = '', tokenRange = '' }) {
    const term = [query, tag].filter(Boolean).join(' ');
    const params = new URLSearchParams({
      search: term,
      first: '24',
      page: String(page),
      sort: sort,
      asc: asc ? 'true' : 'false',
      venus: 'false',
      nsfw: nsfw ? 'true' : 'false'
    });

    if (tokenRange === 'short') {
      params.append('max_tokens', '1000');
    } else if (tokenRange === 'medium') {
      params.append('min_tokens', '1000');
      params.append('max_tokens', '3000');
    } else if (tokenRange === 'long') {
      params.append('min_tokens', '3000');
    }

    const data = await httpFetch(`${this.apiBase}/search?${params}`);
    const nodes = data?.data?.nodes || data?.nodes || [];

    return {
      total: data?.data?.total || nodes.length,
      characters: nodes.map(c => ({
        id: c.fullPath,
        name: c.name || 'Unnamed',
        creator: c.fullPath ? c.fullPath.split('/')[0] : 'Unknown',
        avatarUrl: `${this.avatarBase}/${c.fullPath}/avatar.webp`,
        tagline: c.tagline || (c.description ? c.description.slice(0, 95) + '...' : ''),
        tags: (c.topics || []).filter(t => t && t !== 'ROOT').slice(0, 5),
        downloads: c.download_count || 0,
        stars: c.star_count || 0,
        tokens: c.token_count || 0,
        hasExpressions: Boolean(c.expressions || c.has_expressions || (c.topics && c.topics.includes('expressions'))),
        source: 'chub'
      }))
    };
  },

  async getDetails(fullPath) {
    // 1. Fetch metadata node
    const res = await httpFetch(`${this.apiBase}/api/characters/${fullPath}?full=true`);
    const node = res?.node || res || {};

    // 2. Fetch full Tavern card definition to read greetings and expression data
    let cardData = {};
    try {
      cardData = await httpFetch(`${this.apiBase}/api/characters/download`, {
        method: 'POST',
        body: JSON.stringify({ fullPath, format: 'tavern' }),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      cardData = node.definition || {};
    }

    const d = cardData?.data || cardData || {};
    const ext = d.extensions || {};

    // Detect expression packs
    const exprList = ext.chub?.expressions || node.expressions || [];
    const hasExpr = exprList.length > 0 || Boolean(node.has_expressions) || (node.topics && node.topics.includes('expressions'));

    return {
      id: fullPath,
      name: d.name || node.name || 'Unnamed',
      creator: fullPath.split('/')[0] || 'Unknown',
      avatarUrl: `${this.avatarBase}/${fullPath}/avatar.webp`,
      description: d.description || node.description || 'No description provided.',
      personality: d.personality || node.personality || 'No personality definition visible.',
      scenario: d.scenario || node.scenario || 'No scenario defined.',
      first_mes: d.first_mes || node.first_mes || 'Hello!',
      alternate_greetings: Array.isArray(d.alternate_greetings) ? d.alternate_greetings : [],
      creator_notes: d.creator_notes || ext.creator_notes || '',
      system_prompt: d.system_prompt || '',
      mes_example: d.mes_example || '',
      tags: (node.topics || d.tags || []).filter(t => t && t !== 'ROOT'),
      downloads: node.download_count || 0,
      stars: node.star_count || 0,
      tokens: node.token_count || 0,
      hasExpressions: hasExpr,
      expressionCount: exprList.length,
      hasLorebook: Boolean(ext.world_info || d.character_book),
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
  headers: {
    'X-Datacat-Client-Id': 'datacat_client_v1',
    'Accept': 'application/json'
  },

  async search({ query = '', page = 1, sort = 'popular', tag = '' }) {
    try {
      const term = [query, tag].filter(Boolean).join(' ');
      const endpoint = term
        ? `${this.apiBase}/characters?search=${encodeURIComponent(term)}&page=${page}`
        : `${this.apiBase}/fresh?page=${page}`;

      const data = await httpFetch(endpoint, { headers: this.headers });
      const items = Array.isArray(data) ? data : (data?.characters || data?.nodes || data?.items || data?.data || []);

      return {
        total: items.length,
        characters: items.map(c => ({
          id: c.id,
          name: c.name || 'Unnamed',
          creator: c.creator?.name || c.creator || 'Datacat Creator',
          avatarUrl: `${this.apiBase}/characters/${c.id}/avatar`,
          tagline: c.summary || c.tagline || (c.description ? c.description.slice(0, 95) + '...' : ''),
          tags: (c.tags || []).slice(0, 5),
          downloads: c.kudos || c.downloads || 0,
          stars: 0,
          tokens: c.token_count || 0,
          hasExpressions: false,
          source: 'datacat'
        }))
      };
    } catch {
      return { characters: [] };
    }
  },

  async getDetails(id) {
    const card = await httpFetch(`${this.apiBase}/characters/${id}/card`, { headers: this.headers });
    const d = card?.data || card || {};

    return {
      id,
      name: d.name || 'Datacat Character',
      creator: d.creator || 'Datacat',
      avatarUrl: `${this.apiBase}/characters/${id}/avatar`,
      description: d.description || 'No description provided.',
      personality: d.personality || 'No personality definition visible.',
      scenario: d.scenario || 'No scenario defined.',
      first_mes: d.first_mes || '',
      alternate_greetings: Array.isArray(d.alternate_greetings) ? d.alternate_greetings : [],
      creator_notes: d.creator_notes || '',
      system_prompt: d.system_prompt || '',
      mes_example: d.mes_example || '',
      tags: d.tags || [],
      downloads: 0,
      stars: 0,
      tokens: 0,
      hasExpressions: false,
      hasLorebook: false,
      source: 'datacat'
    };
  },

  async fetchCard(id) {
    const card = await httpFetch(`${this.apiBase}/characters/${id}/card`, { headers: this.headers });
    return { card };
  }
};

// --- PROVIDER: JANNYAI / JANITOR ---
const JannyAI = {
  avatarBase: 'https://image.jannyai.com/bot-avatars',

  extractId(input) {
    const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return match ? match[0] : input.trim();
  },

  async search({ query = '', page = 1, sort = 'download_count', asc = false, nsfw = false, tag = '', tokenRange = '' }) {
    const term = [query, tag, 'JanitorAI'].filter(Boolean).join(' ');
    const params = new URLSearchParams({
      search: term,
      first: '24',
      page: String(page),
      sort: sort,
      asc: asc ? 'true' : 'false',
      venus: 'false',
      nsfw: nsfw ? 'true' : 'false'
    });

    if (tokenRange === 'short') params.append('max_tokens', '1000');
    else if (tokenRange === 'medium') { params.append('min_tokens', '1000'); params.append('max_tokens', '3000'); }
    else if (tokenRange === 'long') params.append('min_tokens', '3000');

    const data = await httpFetch(`https://api.chub.ai/search?${params}`);
    const nodes = data?.data?.nodes || data?.nodes || [];

    return {
      total: data?.data?.total || nodes.length,
      characters: nodes.map(c => ({
        id: c.fullPath,
        name: c.name || 'Unnamed',
        creator: c.fullPath ? c.fullPath.split('/')[0] : 'Janitor Creator',
        avatarUrl: `https://avatars.charhub.io/avatars/${c.fullPath}/avatar.webp`,
        tagline: c.tagline || (c.description ? c.description.slice(0, 95) + '...' : ''),
        tags: (c.topics || []).filter(t => t && t !== 'ROOT').slice(0, 5),
        downloads: c.download_count || 0,
        stars: c.star_count || 0,
        tokens: c.token_count || 0,
        hasExpressions: Boolean(c.expressions || c.has_expressions),
        source: 'janny'
      }))
    };
  },

  async getDetails(idOrPath) {
    if (idOrPath.includes('/')) {
      const res = await httpFetch(`https://api.chub.ai/api/characters/${idOrPath}?full=true`);
      const node = res?.node || res || {};

      let cardData = {};
      try {
        cardData = await httpFetch(`https://api.chub.ai/api/characters/download`, {
          method: 'POST',
          body: JSON.stringify({ fullPath: idOrPath, format: 'tavern' }),
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        cardData = node.definition || {};
      }

      const d = cardData?.data || cardData || {};
      return {
        id: idOrPath,
        name: d.name || node.name || 'Janitor Character',
        creator: idOrPath.split('/')[0] || 'Unknown',
        avatarUrl: `https://avatars.charhub.io/avatars/${idOrPath}/avatar.webp`,
        description: d.description || node.description || 'No description available.',
        personality: d.personality || node.personality || 'No personality definition visible.',
        scenario: d.scenario || node.scenario || 'No scenario defined.',
        first_mes: d.first_mes || node.first_mes || '',
        alternate_greetings: Array.isArray(d.alternate_greetings) ? d.alternate_greetings : [],
        creator_notes: d.creator_notes || '',
        system_prompt: d.system_prompt || '',
        mes_example: d.mes_example || '',
        tags: (node.topics || d.tags || []).filter(t => t && t !== 'ROOT'),
        downloads: node.download_count || 0,
        stars: node.star_count || 0,
        tokens: node.token_count || 0,
        hasExpressions: Boolean(node.expressions || node.has_expressions),
        hasLorebook: Boolean(d.extensions?.world_info),
        source: 'janny'
      };
    }

    const uuid = this.extractId(idOrPath);
    return {
      id: uuid,
      name: 'Janitor Character',
      creator: 'JannyAI',
      avatarUrl: `${this.avatarBase}/${uuid}.webp`,
      description: 'Full definition encoded in the character card. Tap import to load into your chat library.',
      personality: 'Defined inside card specification.',
      scenario: 'Available after import.',
      first_mes: 'Card ready for import.',
      alternate_greetings: [],
      creator_notes: '',
      system_prompt: '',
      mes_example: '',
      tags: ['JanitorAI'],
      downloads: 0,
      stars: 0,
      tokens: 0,
      hasExpressions: false,
      hasLorebook: false,
      source: 'janny'
    };
  },

  async fetchCard(idOrPath) {
    if (!idOrPath.includes('/') || idOrPath.startsWith('http')) {
      const uuid = this.extractId(idOrPath);
      const res = await httpFetch('https://api.jannyai.com/api/v1/download', {
        method: 'POST',
        body: JSON.stringify({ characterId: uuid }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res?.downloadUrl) throw new Error('Could not retrieve card link. Verify character URL/UUID.');
      const imageRes = await fetch(res.downloadUrl);
      const pngBuffer = await imageRes.arrayBuffer();
      return { rawPngBuffer: pngBuffer };
    }

    const cardData = await httpFetch('https://api.chub.ai/api/characters/download', {
      method: 'POST',
      body: JSON.stringify({ fullPath: idOrPath, format: 'tavern' }),
      headers: { 'Content-Type': 'application/json' }
    });
    return { card: cardData };
  }
};

// --- IPC DISPATCHER ---
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
