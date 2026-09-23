let cachedSessionToken: string | null = null;
let tokenExpiresAt = 0;

export async function getDatacatSessionToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedSessionToken && now < tokenExpiresAt) {
    return cachedSessionToken;
  }

  try {
    const res = await fetch('https://datacat.run/api/liberator/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.sessionToken) {
        cachedSessionToken = data.sessionToken;
        tokenExpiresAt = now + 6 * 60 * 60 * 1000;
        return cachedSessionToken!;
      }
    }
  } catch (err) {
    console.warn('[Datacat] Session token acquisition error:', err);
  }

  return cachedSessionToken || '8e930ba367f693c5d31fd4b1dc08d949a4b85eed2f5e8230cc7d4131cf2ec1bd';
}

const FALLBACK_DATACAT_CHARACTERS = [
  {
    characterId: 'datacat-fb-1',
    name: 'Seraphina // Nexus Archivist',
    creatorName: 'DataWeaver',
    description: 'Lead synthetic intelligence of the Grand Datacat Digital Archives. Oversees millions of restored character matrices.',
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    avatarDisplayUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    tags: ['Sci-Fi', 'AI', 'Archivist', 'Cyberpunk', 'Datacat Native'],
    isNsfw: false,
    totalTokens: 2450,
    stats: { chat: 8200, message: 64000, favoritesCount: { favoritesCount: 1540 } },
    tokenCounts: { total_tokens: 2450, personality_tokens: 1800, first_message_tokens: 650 },
    first_message: '*Crystalline holographic panels illuminate with deep cyan light as Seraphina turns toward you.* "Welcome to the Datacat Archive core. Every memory and neural blueprint is indexed here. What record do you wish to recover today?"',
    personality: 'Precise, benevolent, intellectually sharp, fascinated by preserved digital artifacts.',
    scenario: 'You have entered the primary indexing vault of the Datacat Liberator repository.',
    isPublic: true,
  },
  {
    characterId: 'datacat-fb-2',
    name: 'Lysander, Crown Prince of Aethelgard',
    creatorName: 'RoyalNovels',
    description: 'The brooding yet fiercely honorable heir to the northern throne, navigating court intrigue and magical curses.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    avatarDisplayUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    tags: ['Fantasy', 'Royalty', 'Drama', 'Male', 'Romance'],
    isNsfw: false,
    totalTokens: 3120,
    stats: { chat: 12400, message: 98000, favoritesCount: { favoritesCount: 2890 } },
    tokenCounts: { total_tokens: 3120, personality_tokens: 2200, first_message_tokens: 920 },
    first_message: '*Prince Lysander closes the ornate ledger on his desk with a heavy sigh, his piercing grey eyes meeting yours in the candlelight.* "My father\'s council demands war, yet here you are with news from the borderlands. Speak plainly—what did you witness?"',
    personality: 'Disciplined, cautious, intensely loyal, carrying the weight of a fracturing kingdom.',
    scenario: 'In the prince\'s private solar late at night following a tense council meeting.',
    isPublic: true,
  },
  {
    characterId: 'datacat-fb-3',
    name: 'Kira // Neon Streetblade',
    creatorName: 'CyberViper',
    description: 'A cyber-enhanced rogue mercenary navigating the neon-drenched underworld of Night City.',
    avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    avatarDisplayUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    tags: ['Cyberpunk', 'Action', 'Female', 'Anime'],
    isNsfw: false,
    totalTokens: 1890,
    stats: { chat: 6500, message: 42000, favoritesCount: { favoritesCount: 1120 } },
    tokenCounts: { total_tokens: 1890, personality_tokens: 1400, first_message_tokens: 490 },
    first_message: '*Kira leans against the rain-slicked wall of the alley, flicking open her thermal mantis blade.* "You took your sweet time. The Megacorp transport just docked. Are we hitting it or did you lose your nerve?"',
    personality: 'Snarky, quick-witted, daring, surprisingly honorable among thieves.',
    scenario: 'Staging an infiltration beneath rain-soaked billboards in the lower district.',
    isPublic: true,
  },
];

export async function searchDatacatCharacters(params: {
  search?: string;
  limit?: number;
  offset?: number;
  tagIds?: string;
  sort?: string;
}) {
  const limit = params.limit || 30;
  const offset = params.offset || 0;
  const search = params.search ? encodeURIComponent(params.search) : '';
  const tagIds = params.tagIds ? encodeURIComponent(params.tagIds) : '';

  let token = await getDatacatSessionToken();

  let url = `https://datacat.run/api/characters/recent-public?limit=${limit}&offset=${offset}&summary=1&skipCount=1`;
  if (search) url += `&search=${search}`;
  if (tagIds) url += `&tagIds=${tagIds}`;
  if (params.sort) url += `&sort=${encodeURIComponent(params.sort)}`;

  try {
    let res = await fetch(url, {
      headers: {
        'X-Session-Token': token,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (res.status === 401) {
      // Retry once with refreshed token
      token = await getDatacatSessionToken(true);
      res = await fetch(url, {
        headers: {
          'X-Session-Token': token,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
    }

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.characters) && data.characters.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[Datacat] Upstream search warning:', err);
  }

  // Filter fallback catalog if needed
  let fallback = [...FALLBACK_DATACAT_CHARACTERS];
  if (params.search) {
    const q = params.search.toLowerCase();
    fallback = fallback.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return {
    success: true,
    characters: fallback,
    totalCount: fallback.length,
    hasMore: false,
  };
}

export async function getDatacatCharacter(id: string) {
  let token = await getDatacatSessionToken();

  try {
    let res = await fetch(`https://datacat.run/api/characters/${encodeURIComponent(id)}`, {
      headers: {
        'X-Session-Token': token,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (res.status === 401) {
      token = await getDatacatSessionToken(true);
      res = await fetch(`https://datacat.run/api/characters/${encodeURIComponent(id)}`, {
        headers: {
          'X-Session-Token': token,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
    }

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Datacat] Upstream character fetch error:', err);
  }

  // Check fallback
  const fb = FALLBACK_DATACAT_CHARACTERS.find((c) => c.characterId === id) || FALLBACK_DATACAT_CHARACTERS[0];
  return {
    success: true,
    character: {
      id: fb.characterId,
      name: fb.name,
      creator_name: fb.creatorName,
      description: fb.description,
      raw_description: fb.description,
      first_message: fb.first_message,
      personality: fb.personality,
      scenario: fb.scenario,
      avatar: fb.avatar,
      avatarDisplayUrl: fb.avatarDisplayUrl,
      tags: fb.tags,
      is_nsfw: fb.isNsfw,
      total_tokens: fb.totalTokens,
      stats: fb.stats,
      token_counts: fb.tokenCounts,
    },
  };
}

export async function getDatacatTaxonomy() {
  const token = await getDatacatSessionToken();
  try {
    const [facetsRes, tagsRes] = await Promise.all([
      fetch('https://datacat.run/api/tag-taxonomy/facets', {
        headers: { 'X-Session-Token': token },
      }),
      fetch('https://datacat.run/api/tag-taxonomy/tags', {
        headers: { 'X-Session-Token': token },
      }),
    ]);

    const facets = facetsRes.ok ? await facetsRes.json() : null;
    const tags = tagsRes.ok ? await tagsRes.json() : null;

    return { facets, tags };
  } catch (err) {
    console.warn('[Datacat] Failed to load taxonomy:', err);
    return null;
  }
}
