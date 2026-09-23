import { getDatacatSessionToken } from './datacat.ts';

export const JANITOR_TAGS = [
  { id: 2, name: 'Female', slug: 'female' },
  { id: 1, name: 'Male', slug: 'male' },
  { id: 6, name: 'Anime', slug: 'anime' },
  { id: 5, name: 'OC', slug: 'oc' },
  { id: 4, name: 'Fictional', slug: 'fictional' },
  { id: 7, name: 'Game', slug: 'game' },
  { id: 14, name: 'Villain', slug: 'villain' },
  { id: 28, name: 'Dominant', slug: 'dominant' },
  { id: 29, name: 'Submissive', slug: 'submissive' },
  { id: 42, name: 'AnyPOV', slug: 'anypov' },
  { id: 60, name: 'Sci-Fi', slug: 'scifi' },
  { id: 61, name: 'Fantasy', slug: 'fantasy' },
  { id: 12, name: 'Monster', slug: 'monster' },
  { id: 18, name: 'Enemies to Lovers', slug: 'enemies-to-lovers' },
  { id: 24, name: 'Royalty', slug: 'royalty' },
  { id: 35, name: 'Non-human', slug: 'non-human' },
  { id: 48, name: 'Multiple', slug: 'multiple' },
  { id: 55, name: 'RPG', slug: 'rpg' },
];

export async function searchJanitorCharacters(params: {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  tagId?: string;
}) {
  const token = await getDatacatSessionToken();
  const limit = params.limit || 30;
  const offset = params.offset || 0;
  const search = params.search ? encodeURIComponent(params.search) : '';
  const tagId = params.tagId ? encodeURIComponent(params.tagId) : '';

  // Query Datacat's comprehensive JanitorAI archive
  let url = `https://datacat.run/api/characters/recent-public?limit=${limit}&offset=${offset}&summary=1&skipCount=1`;
  if (search) url += `&search=${search}`;
  if (tagId) url += `&tagIds=${tagId}`;

  const res = await fetch(url, {
    headers: {
      'X-Session-Token': token,
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`Janitor search failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const rawCharacters: any[] = data.characters || [];

  // Filter or transform to ensure authentic Janitor character format
  const characters = rawCharacters.map((c) => {
    return {
      id: c.characterId || c.character_id || c.id,
      sourceId: 'janitor',
      sourceName: 'JanitorAI',
      name: c.name,
      creator: c.creatorName || c.creator_name || 'Anonymous',
      creatorId: c.creatorId || c.creator_id,
      description: c.description || '',
      rawDescription: c.rawDescription || c.raw_description || '',
      avatarUrl: c.avatarVariantUrls?.card || c.avatarDisplayUrl || c.avatar || '',
      tags: Array.isArray(c.tags) ? c.tags.map((t: any) => typeof t === 'string' ? t : t.name || t.slug) : [],
      createdAt: c.createdAt || c.created_at,
      updatedAt: c.extractedAt || c.firstPublishedAt,
      isNsfw: Boolean(c.isNsfw),
      totalTokens: c.tokenCounts?.total_tokens || c.totalTokens || 0,
      janitorMetadata: {
        chatCount: c.stats?.chat || 0,
        messageCount: c.stats?.message || 0,
        favoritesCount: c.stats?.favoritesCount?.favoritesCount || 0,
        allowProxy: c.allowProxy !== false && c.allow_proxy !== false,
        isPublic: c.isPublic !== false,
        definitionPublic: true,
        personalityTokens: c.tokenCounts?.personality_tokens || 0,
        permanentTokens: c.tokenCounts?.permanent_tokens || 0,
        firstMessageTokens: c.tokenCounts?.first_message_tokens || 0,
        jannyaiRecoveryState: c.jannyaiRecoveryState || c.jannyai_recovery_state,
      },
    };
  });

  // Client/server sort if specified
  if (params.sort === 'popular') {
    characters.sort((a, b) => ((b.janitorMetadata?.chatCount || 0) - (a.janitorMetadata?.chatCount || 0)));
  } else if (params.sort === 'messages') {
    characters.sort((a, b) => ((b.janitorMetadata?.messageCount || 0) - (a.janitorMetadata?.messageCount || 0)));
  } else if (params.sort === 'tokens') {
    characters.sort((a, b) => ((b.totalTokens || 0) - (a.totalTokens || 0)));
  }

  return {
    success: true,
    count: characters.length,
    characters,
  };
}

export async function getJanitorCharacter(id: string) {
  const token = await getDatacatSessionToken();
  const res = await fetch(`https://datacat.run/api/characters/${encodeURIComponent(id)}`, {
    headers: {
      'X-Session-Token': token,
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`Janitor character retrieval failed: ${res.status}`);
  }

  const data = await res.json();
  const c = data.character;

  if (!c) {
    throw new Error('Character not found');
  }

  return {
    id: c.character_id || c.id,
    sourceId: 'janitor',
    sourceName: 'JanitorAI',
    name: c.name,
    creator: c.creator_name || c.creatorName || 'Anonymous',
    creatorId: c.creator_id,
    description: c.description || '',
    rawDescription: c.rawDescription || c.raw_description || '',
    firstMessage: c.first_message || c.firstMessage || '',
    personality: c.personality || '',
    scenario: c.scenario || '',
    exampleDialogue: c.example_dialogue || '',
    alternateGreetings: c.alternate_greetings || [],
    avatarUrl: c.avatarVariantUrls?.hero || c.avatarVariantUrls?.card || c.avatarDisplayUrl || c.avatar || '',
    tags: Array.isArray(c.tags) ? c.tags.map((t: any) => typeof t === 'string' ? t : t.name || t.slug) : [],
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    isNsfw: Boolean(c.is_nsfw),
    totalTokens: c.token_counts?.total_tokens || c.totalTokens || 0,
    janitorMetadata: {
      chatCount: c.stats?.chat || 0,
      messageCount: c.stats?.message || 0,
      favoritesCount: c.stats?.favoritesCount?.favoritesCount || 0,
      allowProxy: c.allow_proxy !== false,
      isPublic: c.is_public !== false,
      definitionPublic: Boolean(c.full_definition_revealed_by_author ?? true),
      personalityTokens: c.token_counts?.personality_tokens || 0,
      permanentTokens: c.token_counts?.permanent_tokens || 0,
      firstMessageTokens: c.token_counts?.first_message_tokens || 0,
      customTags: c.custom_tags || [],
      janitorUserId: c.user_id,
    },
    rawCardData: c.chara_card_v2_json || null,
  };
}
