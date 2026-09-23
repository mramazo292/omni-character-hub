// --- PROVIDER: CHUB.AI ---
const Chub = {
  apiBase: 'https://api.chub.ai',
  avatarBase: 'https://avatars.charhub.io/avatars',

  async search({ query = '', page = 1, sort = 'download_count', nsfw = false, tag = '' }) {
    const searchTerm = [query, tag].filter(Boolean).join(' ');
    const params = new URLSearchParams({
      search: searchTerm,
      first: '24',
      page: String(page),
      sort: sort, // 'download_count' | 'last_activity_at' | 'star_count'
      venus: 'false',
      asc: 'false',
      nsfw: nsfw ? 'true' : 'false'
    });

    const res = await fetch(`${this.apiBase}/search?${params}`);
    if (!res.ok) throw new Error(`Chub search failed (${res.status})`);
    const data = await res.json();
    const nodes = data?.data?.nodes || data?.nodes || [];

    return {
      characters: nodes.map(c => ({
        id: c.fullPath,
        name: c.name || 'Unnamed',
        creator: c.fullPath ? c.fullPath.split('/')[0] : 'Unknown',
        avatarUrl: `${this.avatarBase}/${c.fullPath}/avatar.webp`,
        tagline: c.tagline || '',
        tags: (c.topics || []).filter(t => t && t !== 'ROOT').slice(0, 5),
        downloads: c.download_count || 0,
        stars: c.star_count || 0,
        source: 'chub'
      }))
    };
  },

  async fetchCard(fullPath) {
    const res = await fetch(`${this.apiBase}/api/characters/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullPath, format: 'tavern' })
    });
    if (!res.ok) throw new Error('Failed to download card from Chub');
    const cardData = await res.json();

    const avatarRes = await fetch(`${this.avatarBase}/${fullPath}/avatar.webp`);
    const avatarBuffer = await avatarRes.arrayBuffer();

    return { card: cardData, avatarBuffer };
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
    // JannyAI catalog retrieval
    try {
      const endpoint = `${this.apiBase}/characters?search=${encodeURIComponent(query)}&page=${page}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const items = data.data || data.characters || [];

      return {
        characters: items.map(c => ({
          id: c.id || c.characterId,
          name: c.name || 'Unnamed',
          creator: c.creator || c.author || 'JannyAI',
          avatarUrl: c.avatar || `https://image.jannyai.com/bot-avatars/${c.id}.webp`,
          tagline: c.description?.slice(0, 100) || '',
          tags: (c.tags || []).slice(0, 5),
          downloads: c.downloads || 0,
          stars: c.rating || 0,
          source: 'janny'
        }))
      };
    } catch {
      // Friendly fallback if search API undergoes maintenance or requires direct link
      return { characters: [] };
    }
  },

  async fetchCard(idOrUrl) {
    const characterId = this.extractId(idOrUrl);
    const res = await fetch(`${this.apiBase}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId })
    });

    if (!res.ok) throw new Error(`JannyAI character not found or protected. Check the URL/ID.`);
    const payload = await res.json();
    if (!payload.downloadUrl) throw new Error('No download link returned by JannyAI');

    const imageRes = await fetch(payload.downloadUrl);
    const pngBuffer = await imageRes.arrayBuffer();

    return { rawPngBuffer: pngBuffer };
  }
};

// --- PROVIDER: DATACAT (datacat.run) ---
const Datacat = {
  apiBase: 'https://datacat.run/api/client/v1',

  async search({ query = '', page = 1, sort = 'popular' }) {
    try {
      const url = query 
        ? `${this.apiBase}/characters?search=${encodeURIComponent(query)}&page=${page}`
        : `${this.apiBase}/fresh?page=${page}`;

      const res = await fetch(url, {
        headers: { 'X-Datacat-Client-Id': 'datacat_client_v1' }
      });
      if (!res.ok) throw new Error(`Datacat error ${res.status}`);
      const data = await res.json();
      const items = data.characters || data.items || [];

      return {
        characters: items.map(c => ({
          id: c.id,
          name: c.name,
          creator: c.creator?.name || 'Unknown',
          avatarUrl: `${this.apiBase}/characters/${c.id}/avatar`,
          tagline: c.summary || c.tagline || '',
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

  async fetchCard(id) {
    const cardRes = await fetch(`${this.apiBase}/characters/${id}/card`, {
      headers: { 'X-Datacat-Client-Id': 'datacat_client_v1' }
    });
    if (!cardRes.ok) throw new Error('Datacat card fetch failed');
    const card = await cardRes.json();

    const avatarRes = await fetch(`${this.apiBase}/characters/${id}/avatar`, {
      headers: { 'X-Datacat-Client-Id': 'datacat_client_v1' }
    });
    const avatarBuffer = await avatarRes.arrayBuffer();

    return { card, avatarBuffer };
  }
};

// Standard CCv2 Normalizer
function normalizeCard(cardData) {
  const d = cardData.data || cardData;
  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: d.name || 'Unnamed',
      description: d.description || '',
      personality: d.personality || '',
      scenario: d.scenario || '',
      first_mes: d.first_mes || '',
      mes_example: d.mes_example || '',
      creator_notes: d.creator_notes || '',
      tags: Array.isArray(d.tags) ? d.tags : (Array.isArray(d.topics) ? d.topics : [])
    }
  };
}

// Spindle IPC Handlers
const providers = { chub: Chub, janny: JannyAI, datacat: Datacat };

spindle.onFrontendMessage(async (msg, userId) => {
  const { action, provider = 'chub', payload = {}, requestId } = msg;

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
      let imported;

      if (cardPayload.rawPngBuffer) {
        imported = await spindle.characters.importFile(cardPayload.rawPngBuffer);
      } else {
        imported = await spindle.characters.create({
          cardData: normalizeCard(cardPayload.card),
          avatar: cardPayload.avatarBuffer
        });
      }

      spindle.sendToFrontend({
        type: 'IMPORT_SUCCESS',
        requestId,
        characterName: imported?.name || 'Character'
      }, userId);
    }
  } catch (err) {
    spindle.sendToFrontend({
      type: 'ERROR',
      requestId,
      error: err.message || 'Operation failed'
    }, userId);
  }
});
