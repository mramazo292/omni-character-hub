// --- PROVIDER: CHUB.AI ---
const Chub = {
  apiBase: 'https://api.chub.ai',
  avatarBase: 'https://avatars.charhub.io/avatars',

  async search({ query = '', page = 1, nsfw = false }) {
    const params = new URLSearchParams({
      search: query,
      page: String(page),
      sort: 'download_count',
      nsfw: nsfw ? 'true' : 'false'
    });
    const res = await fetch(`${this.apiBase}/api/characters/search?${params}`);
    if (!res.ok) throw new Error('Chub search failed');
    const data = await res.json();

    return {
      characters: (data.nodes || []).map(c => ({
        id: c.fullPath,
        name: c.name,
        creator: c.fullPath?.split('/')[0] || 'Unknown',
        avatarUrl: `${this.avatarBase}/${c.fullPath}/avatar.webp`
      }))
    };
  },

  async fetchCard(fullPath) {
    const res = await fetch(`${this.apiBase}/api/characters/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullPath, format: 'tavern' })
    });
    if (!res.ok) throw new Error('Chub download failed');
    const cardData = await res.json();

    const avatarRes = await fetch(`${this.avatarBase}/${fullPath}/avatar.webp`);
    const avatarBuffer = await avatarRes.arrayBuffer();

    return { card: cardData, avatarBuffer };
  }
};

// --- PROVIDER: DATACAT ---
const Datacat = {
  apiBase: 'https://datacat.run/api/client/v1',

  async search({ query = '', page = 1 }) {
    const url = query 
      ? `${this.apiBase}/characters?search=${encodeURIComponent(query)}&page=${page}`
      : `${this.apiBase}/fresh?page=${page}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Datacat search failed');
    const data = await res.json();
    const items = data.characters || data.items || [];

    return {
      characters: items.map(c => ({
        id: c.id,
        name: c.name,
        creator: c.creator?.name || 'Unknown',
        avatarUrl: `${this.apiBase}/characters/${c.id}/avatar`
      }))
    };
  },

  async fetchCard(id) {
    const cardRes = await fetch(`${this.apiBase}/characters/${id}/card`);
    if (!cardRes.ok) throw new Error('Datacat card fetch failed');
    const card = await cardRes.json();

    const avatarRes = await fetch(`${this.apiBase}/characters/${id}/avatar`);
    const avatarBuffer = await avatarRes.arrayBuffer();

    return { card, avatarBuffer };
  }
};

// --- PROVIDER: JANITOR / JANNY ---
const Janny = {
  apiBase: 'https://api.jannyai.com/api/v1',

  extractId(input) {
    const match = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return match ? match[0] : input.trim();
  },

  async search({ query = '', page = 1 }) {
    const res = await fetch(`${this.apiBase}/characters?search=${encodeURIComponent(query)}&page=${page}`);
    if (!res.ok) throw new Error('Janny search failed');
    const data = await res.json();
    const items = data.data || data.characters || [];

    return {
      characters: items.map(c => ({
        id: c.id || c.characterId,
        name: c.name,
        creator: c.creator || c.author || 'Unknown',
        avatarUrl: c.avatar || `https://image.jannyai.com/bot-avatars/${c.id}.webp`
      }))
    };
  },

  async fetchCard(idOrUrl) {
    const characterId = this.extractId(idOrUrl);
    const res = await fetch(`${this.apiBase}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId })
    });

    if (!res.ok) throw new Error('Janitor bot not available on proxy index');
    const payload = await res.json();
    if (!payload.downloadUrl) throw new Error('Download URL not found');

    const imageRes = await fetch(payload.downloadUrl);
    const pngBuffer = await imageRes.arrayBuffer();

    return { rawPngBuffer: pngBuffer };
  }
};

// --- NORMALIZATION HELPER ---
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
      tags: Array.isArray(d.tags) ? d.tags : []
    }
  };
}

// --- SPINDLE LISTENER ---
const providers = { chub: Chub, datacat: Datacat, janny: Janny };

spindle.onFrontendMessage(async (msg, userId) => {
  const { action, provider = 'chub', payload, requestId } = msg;

  try {
    const current = providers[provider];
    if (!current) throw new Error('Unknown source');

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
