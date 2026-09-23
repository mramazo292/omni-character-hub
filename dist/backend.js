// --- RESILIENT NETWORK ENGINE (Host proxy + Native fallback) ---
async function httpFetch(url, options = {}) {
  const headers = {
    'Accept': 'application/json, text/html, */*',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
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

// --- PROVIDER: CHUB.AI ---
const Chub = {
  apiBase: 'https://api.chub.ai',
  avatarBase: 'https://avatars.charhub.io/avatars',

  async search({ query = '', page = 1, sort = 'download_count', asc = false, nsfw = false, tag = '', tokenRange = '' }) {
    const params = new URLSearchParams({
      search: query,
      first: '24',
      page: String(page),
      sort: sort,
      asc: asc ? 'true' : 'false',
      venus: 'false',
      nsfw: nsfw ? 'true' : 'false'
    });

    if (tag) params.append('topics', tag);
    if (tokenRange === 'short') params.append('max_tokens', '1000');
    else if (tokenRange === 'medium') { params.append('min_tokens', '1000'); params.append('max_tokens', '3000'); }
    else if (tokenRange === 'long') params.append('min_tokens', '3000');

    const data = await httpFetch(`${this.apiBase}/search?${params}`);
    const nodes = data?.data?.nodes || data?.nodes || [];

    return {
      total: data?.data?.total || nodes.length,
      characters: nodes.map(c => ({
        id: c.fullPath,
        name: c.name || 'Unnamed',
        creator: c.fullPath ? c.fullPath.split('/')[0] : 'Unknown',
        avatarUrl: `${this.avatarBase}/${c.fullPath}/avatar.webp`,
        webSummary: c.tagline || (c.description ? c.description.slice(0, 95) + '...' : ''),
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
    const exprList = ext.chub?.expressions || node.expressions || [];
    const hasExpr = exprList.length > 0 || Boolean(node.has_expressions) || (node.topics && node.topics.includes('expressions'));

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
      descTokens: approxTokens(charDesc),
      greetingTokens: approxTokens(charFirstMes),
      hasExpressions: hasExpr,
      expressionCount: exprList.length,
      hasLorebook: Boolean(ext.world_info || d.character_book),
      createdAt: node.created_at ? new Date(node.created_at).toLocaleDateString() : 'Unknown',
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

// --- PROVIDER: JANNYAI / JANITOR ---
const JannyAI = {
  avatarBase: 'https://image.jannyai.com/bot-avatars',

  extractId(input) {
    const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return match ? match[0] : input.trim();
  },

  async search({ query = '', page = 1, sort = 'download_count', asc = false, nsfw = false, tag = '' }) {
    // Map Janitor sorts cleanly to backend index
    let sortField = sort;
    if (sort === 'trending') sortField = 'star_count';
    else if (sort === 'popular') sortField = 'download_count';
    else if (sort === 'recent') sortField = 'created_at';
    else if (sort === 'active') sortField = 'last_activity_at';

    const params = new URLSearchParams({
      search: query,
      first: '24',
      page: String(page),
      sort: sortField,
      asc: asc ? 'true' : 'false',
      venus: 'false',
      nsfw: nsfw ? 'true' : 'false'
    });

    // Use specific topic filter
    if (tag) {
      params.append('topics', tag);
    } else {
      params.append('topics', 'JanitorAI');
    }

    const data = await httpFetch(`https://api.chub.ai/search?${params}`);
    const nodes = data?.data?.nodes || data?.nodes || [];

    return {
      total: data?.data?.total || nodes.length,
      characters: nodes.map(c => ({
        id: c.fullPath,
        name: c.name || 'Unnamed',
        creator: c.fullPath ? c.fullPath.split('/')[0] : 'Janitor Creator',
        avatarUrl: `https://avatars.charhub.io/avatars/${c.fullPath}/avatar.webp`,
        webSummary: c.tagline || (c.description ? c.description.slice(0, 95) + '...' : ''),
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
      } catch {
        cardData = node.definition || {};
      }

      const d = cardData?.data || cardData || {};
      const charDesc = d.description || node.description || '';
      const charPers = d.personality || node.personality || '';
      const charFirstMes = d.first_mes || node.first_mes || '';

      return {
        id: idOrPath,
        name: d.name || node.name || 'Janitor Character',
        creator: idOrPath.split('/')[0] || 'Unknown',
        avatarUrl: `https://avatars.charhub.io/avatars/${idOrPath}/avatar.webp`,
        webSummary: node.tagline || node.description || 'Janitor character definition.',
        charDescription: charDesc || 'Prompt definition encoded in card.',
        personality: charPers || 'Personality defined in card.',
        scenario: d.scenario || node.scenario || 'No specific scenario.',
        first_mes: charFirstMes || 'Hello!',
        alternate_greetings: Array.isArray(d.alternate_greetings) ? d.alternate_greetings : [],
        creator_notes: d.creator_notes || '',
        system_prompt: d.system_prompt || '',
        mes_example: d.mes_example || '',
        tags: (node.topics || d.tags || []).filter(t => t && t !== 'ROOT'),
        downloads: node.download_count || 0,
        stars: node.star_count || 0,
        totalTokens: node.token_count || approxTokens(charDesc + charPers + charFirstMes),
        descTokens: approxTokens(charDesc),
        greetingTokens: approxTokens(charFirstMes),
        hasExpressions: Boolean(node.expressions || node.has_expressions),
        hasLorebook: Boolean(d.extensions?.world_info),
        createdAt: node.created_at ? new Date(node.created_at).toLocaleDateString() : 'Janitor',
        source: 'janny'
      };
    }

    const uuid = this.extractId(idOrPath);
    return {
      id: uuid,
      name: 'Janitor Character',
      creator: 'JannyAI',
      avatarUrl: `${this.avatarBase}/${uuid}.webp`,
      webSummary: 'Direct card export. All character prompt fields and instructions are packaged for Lumiverse.',
      charDescription: 'Full prompt definition will be parsed upon card download.',
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
      descTokens: 0,
      greetingTokens: 0,
      hasExpressions: false,
      hasLorebook: false,
      createdAt: 'JanitorAI',
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

      if (!res?.downloadUrl) throw new Error('Could not download from JannyAI. Verify character URL/UUID.');
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

// --- PROVIDER: DATACAT (datacat.run) ---
const Datacat = {
  apiBase: 'https://datacat.run',

  async search({ query = '', page = 1, sort = 'fresh', tag = '' }) {
    const term = [query, tag].filter(Boolean).join(' ');

    // 1. Try public client API
    try {
      const endpoint = term
        ? `${this.apiBase}/api/client/v1/characters?search=${encodeURIComponent(term)}&page=${page}&anonymous=1`
        : `${this.apiBase}/api/client/v1/fresh?page=${page}&anonymous=1`;

      const data = await httpFetch(endpoint, {
        headers: { 'X-Datacat-Client-Id': 'datacat_client_v1', 'Accept': 'application/json' }
      });
      const items = Array.isArray(data) ? data : (data?.characters || data?.nodes || data?.items || data?.data);
      if (Array.isArray(items) && items.length > 0) {
        return {
          total: items.length,
          characters: items.map(c => ({
            id: c.id,
            name: c.name || 'Unnamed',
            creator: c.creator?.name || c.creator || 'Datacat Creator',
            avatarUrl: `${this.apiBase}/api/client/v1/characters/${c.id}/avatar`,
            webSummary: c.summary || c.tagline || (c.description ? c.description.slice(0, 95) + '...' : ''),
            tags: (c.tags || []).slice(0, 5),
            downloads: c.kudos || c.downloads || 0,
            stars: 0,
            tokens: c.token_count || 0,
            hasExpressions: false,
            source: 'datacat'
          }))
        };
      }
    } catch {}

    // 2. HTML Scraper Fallback
    try {
      const html = await httpFetch(`${this.apiBase}/characters/recent?page=${page}&q=${encodeURIComponent(term)}`);
      if (typeof html === 'string') {
        const regex = /href="\/characters\/([^"]+)"[^>]*>.*?src="([^"]+)".*?<h3[^>]*>([^<]+)<\/h3>/gis;
        const characters = [];
        let m;
        while ((m = regex.exec(html)) !== null && characters.length < 24) {
          characters.push({
            id: m[1],
            name: m[3].trim(),
            creator: 'Datacat Creator',
            avatarUrl: m[2].startsWith('http') ? m[2] : `${this.apiBase}${m[2]}`,
            webSummary: 'Archived character card from Datacat catalog.',
            tags: ['Datacat', 'Janitor'],
            downloads: 0,
            stars: 0,
            tokens: 0,
            hasExpressions: false,
            source: 'datacat'
          });
        }
        if (characters.length > 0) return { total: characters.length, characters };
      }
    } catch {}

    return { total: 0, characters: [] };
  },

  async getDetails(id) {
    let d = {};
    try {
      const card = await httpFetch(`${this.apiBase}/api/client/v1/characters/${id}/card?anonymous=1`, {
        headers: { 'X-Datacat-Client-Id': 'datacat_client_v1' }
      });
      d = card?.data || card || {};
    } catch {}

    const charDesc = d.description || '';
    const charPers = d.personality || '';
    const charFirstMes = d.first_mes || '';

    return {
      id,
      name: d.name || 'Datacat Character',
      creator: d.creator || 'Datacat',
      avatarUrl: `${this.apiBase}/api/client/v1/characters/${id}/avatar?anonymous=1`,
      webSummary: d.creator_notes || d.description?.slice(0, 140) || 'Archived character card from Datacat.',
      charDescription: charDesc || 'Prompt definition encoded in card.',
      personality: charPers || 'Standard personality traits.',
      scenario: d.scenario || 'No scenario defined.',
      first_mes: charFirstMes || 'Ready for chat.',
      alternate_greetings: Array.isArray(d.alternate_greetings) ? d.alternate_greetings : [],
      creator_notes: d.creator_notes || '',
      system_prompt: d.system_prompt || '',
      mes_example: d.mes_example || '',
      tags: d.tags || ['Datacat'],
      downloads: 0,
      stars: 0,
      totalTokens: approxTokens(charDesc + charPers + charFirstMes),
      descTokens: approxTokens(charDesc),
      greetingTokens: approxTokens(charFirstMes),
      hasExpressions: false,
      hasLorebook: false,
      createdAt: 'Archive',
      source: 'datacat'
    };
  },

  async fetchCard(id) {
    const card = await httpFetch(`${this.apiBase}/api/client/v1/characters/${id}/card?anonymous=1`, {
      headers: { 'X-Datacat-Client-Id': 'datacat_client_v1' }
    });
    return { card };
  }
};

// --- IPC DISPATCHER ---
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
