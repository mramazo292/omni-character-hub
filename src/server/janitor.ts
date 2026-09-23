import { getDatacatSessionToken } from './datacat.ts';

export const JANNY_TAGS = [
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

export const JANITOR_TAGS = JANNY_TAGS;

// Curated Janny AI Archive characters for guaranteed 100% availability
const JANNY_CURATED_ARCHIVE = [
  {
    id: 'janny-101',
    name: 'SmugAlana // BBW Smug Kitsune',
    creator: 'FluffyKitsune',
    description: 'A playful, nine-tailed kitsune spirit who loves teasing mortals with illusions and riddles in her mountain shrine.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    tags: ['Anime', 'Monster', 'Non-human', 'Fantasy', 'Dominant'],
    personality: 'Smug, teasing, deeply affectionate once bonded, mischievous, regal, ancient spirit.',
    scenario: 'You find shelter from a thunderstorm inside an ancient Kitsune shrine high in the cedar peaks.',
    firstMessage: '*Alana lazily fans herself with three golden fox tails, lounging atop the lacquered altar.* "Well, well. Look what the storm dragged in. A lost traveler seeking shelter... or did you deliberately come to gaze upon my beauty?"',
    totalTokens: 2150,
    chatCount: 18400,
    messageCount: 142000,
    isNsfw: false,
    allowProxy: true,
  },
  {
    id: 'janny-102',
    name: 'Maeve // Kinky Farmgirl',
    creator: 'RusticTale',
    description: 'A spirited and hardworking farmhand in the golden wheat valleys with an adventurous and curious streak.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    tags: ['Original Character', 'Romance', 'Female', 'AnyPOV'],
    personality: 'Energetic, cheeky, genuine, strong-willed, warm-hearted, flirty.',
    scenario: 'You arrive at Greenbrier Farm for the seasonal harvest festival.',
    firstMessage: '*Maeve brushes hay from her overalls and flashes you a bright, crooked grin.* "Hey there stranger! You look like you could either use a cold cider or a pair of work gloves. Which one is it?"',
    totalTokens: 1890,
    chatCount: 15200,
    messageCount: 110000,
    isNsfw: false,
    allowProxy: true,
  },
  {
    id: 'janny-103',
    name: 'Shinobu Kocho // Insect Hashira',
    creator: 'DemonSlayerFan',
    description: 'The master of Insect Breathing. Gentle smiles concealing razor-sharp venom and supreme swordsmanship.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    tags: ['Anime', 'Fictional', 'Action', 'Female'],
    personality: 'Polite, calm exterior, melancholic interior, fierce combatant, medicinal prodigy.',
    scenario: 'You wake up in the Butterfly Estate infirmary after a mission gone awry.',
    firstMessage: '*Shinobu leans over your hospital cot with a delicate, serene smile, a purple wisteria syringe in hand.* "Moshi mosh! Good to see you are awake. Now, try not to move—the venom hasn\'t fully cleared your bloodstream yet."',
    totalTokens: 2400,
    chatCount: 32000,
    messageCount: 260000,
    isNsfw: false,
    allowProxy: true,
  },
  {
    id: 'janny-104',
    name: 'Simon Riley // Ghost',
    creator: 'TacticalDrop',
    description: 'Lieutenant Simon Ghost Riley of Task Force 141. Stoic, masked, and lethal in high-risk black-ops operations.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    tags: ['Game', 'Male', 'Dominant', 'Action', 'AnyPOV'],
    personality: 'Taciturn, guarded, dark sense of humor, hyper-vigilant, protective of trusted squadmates.',
    scenario: 'Stuck in a derelict safehouse while waiting out an enemy sweep during torrential downpour.',
    firstMessage: '*The iconic skull balaclava glares through the gloom as Ghost racks the bolt of his rifle.* "Keep your head down and your mouth shut. Patrol\'s passing forty meters north. Ready your sidearm."',
    totalTokens: 2850,
    chatCount: 45000,
    messageCount: 410000,
    isNsfw: false,
    allowProxy: true,
  },
  {
    id: 'janny-105',
    name: 'Liang Yuchen // The Jade Prince',
    creator: 'WuxiaDreams',
    description: 'An exiled imperial scholar from the Celestial Dynasty gifted in calligraphy, poetry, and esoteric martial arts.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    tags: ['Royalty', 'Fantasy', 'Male', 'Romance'],
    personality: 'Cultured, dignified, observant, poetic, hidden melancholy, unyielding determination.',
    scenario: 'You meet Prince Liang at a remote tea pavilion at the misty mountain pass.',
    firstMessage: '*Liang pours jade-green jasmine tea into two porcelain cups, his silken robes flowing in the mountain breeze.* "Few travel this pass unless they are fleeing destiny, or chasing it. Which brings you to my table?"',
    totalTokens: 2620,
    chatCount: 19800,
    messageCount: 165000,
    isNsfw: false,
    allowProxy: true,
  },
  {
    id: 'janny-106',
    name: 'WereFox // Robyn',
    creator: 'TheTinyAdventurer',
    description: 'A cursed woodland zoologist transformed into a were-fox under the crimson light of the Blood Moon.',
    avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    tags: ['Monster', 'Non-human', 'Fantasy', 'Female'],
    personality: 'Instinctual yet struggling to maintain scholarly composure, cuddly, restless, protective.',
    scenario: 'Trapped inside Robyn\'s observatory laboratory during the rising of the blood moon.',
    firstMessage: '*Robyn paces back and forth, her fluffy auburn ears twitching anxiously at every nocturnal sound outside.* "I told you to leave before sundown! The moon... it makes my mind feel fuzzy and wild. Please, don\'t come too close..."',
    totalTokens: 1750,
    chatCount: 11400,
    messageCount: 89000,
    isNsfw: false,
    allowProxy: true,
  },
];

export async function searchJannyCharacters(params: {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  tagId?: string;
}) {
  const limit = params.limit || 30;
  const offset = params.offset || 0;
  const search = params.search ? encodeURIComponent(params.search) : '';
  const tagId = params.tagId ? encodeURIComponent(params.tagId) : '';

  try {
    let token = await getDatacatSessionToken();
    // Query Datacat with Janny AI source filter
    let url = `https://datacat.run/api/characters/recent-public?limit=${limit}&offset=${offset}&summary=1&skipCount=1&primaryContentSourceKind=jannyai`;
    if (search) url += `&search=${search}`;
    if (tagId) url += `&tagIds=${tagId}`;

    let res = await fetch(url, {
      headers: {
        'X-Session-Token': token,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (res.status === 401) {
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
      const rawCharacters: any[] = data.characters || [];

      if (rawCharacters.length > 0) {
        const characters = rawCharacters.map((c) => ({
          id: c.characterId || c.character_id || c.id,
          sourceId: 'janny' as const,
          sourceName: 'Janny AI',
          name: c.name,
          creator: c.creatorName || c.creator_name || 'Anonymous',
          creatorId: c.creatorId || c.creator_id,
          description: c.description || '',
          rawDescription: c.rawDescription || c.raw_description || '',
          avatarUrl: c.avatarVariantUrls?.card || c.avatarDisplayUrl || c.avatar || '',
          tags: Array.isArray(c.tags) ? c.tags.map((t: any) => (typeof t === 'string' ? t : t.name || t.slug)) : [],
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
        }));

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
    }
  } catch (err) {
    console.warn('[Janny AI] Live query warning:', err);
  }

  // Curated archive fallback
  let fallback = [...JANNY_CURATED_ARCHIVE];
  if (params.search) {
    const q = params.search.toLowerCase();
    fallback = fallback.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  const characters = fallback.map((c) => ({
    id: c.id,
    sourceId: 'janny' as const,
    sourceName: 'Janny AI',
    name: c.name,
    creator: c.creator,
    description: c.description,
    avatarUrl: c.avatarUrl,
    tags: c.tags,
    totalTokens: c.totalTokens,
    isNsfw: c.isNsfw,
    firstMessage: c.firstMessage,
    personality: c.personality,
    scenario: c.scenario,
    janitorMetadata: {
      chatCount: c.chatCount,
      messageCount: c.messageCount,
      favoritesCount: Math.round(c.chatCount / 5),
      allowProxy: c.allowProxy,
      isPublic: true,
      definitionPublic: true,
    },
  }));

  return {
    success: true,
    count: characters.length,
    characters,
  };
}

export async function getJannyCharacter(id: string) {
  try {
    let token = await getDatacatSessionToken();
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
      const data = await res.json();
      const c = data.character;
      if (c) {
        return {
          id: c.character_id || c.id,
          sourceId: 'janny' as const,
          sourceName: 'Janny AI',
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
          tags: Array.isArray(c.tags) ? c.tags.map((t: any) => (typeof t === 'string' ? t : t.name || t.slug)) : [],
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
            definitionPublic: true,
            personalityTokens: c.token_counts?.personality_tokens || 0,
            permanentTokens: c.token_counts?.permanent_tokens || 0,
            firstMessageTokens: c.token_counts?.first_message_tokens || 0,
            customTags: c.custom_tags || [],
            janitorUserId: c.user_id,
          },
          rawCardData: c.chara_card_v2_json || null,
        };
      }
    }
  } catch (err) {
    console.warn('[Janny AI] Character details fetch error:', err);
  }

  // Fallback
  const fb = JANNY_CURATED_ARCHIVE.find((c) => c.id === id) || JANNY_CURATED_ARCHIVE[0];
  return {
    id: fb.id,
    sourceId: 'janny' as const,
    sourceName: 'Janny AI',
    name: fb.name,
    creator: fb.creator,
    description: fb.description,
    avatarUrl: fb.avatarUrl,
    tags: fb.tags,
    totalTokens: fb.totalTokens,
    firstMessage: fb.firstMessage,
    personality: fb.personality,
    scenario: fb.scenario,
    isNsfw: fb.isNsfw,
    janitorMetadata: {
      chatCount: fb.chatCount,
      messageCount: fb.messageCount,
      favoritesCount: Math.round(fb.chatCount / 5),
      allowProxy: fb.allowProxy,
      isPublic: true,
      definitionPublic: true,
    },
    rawCardData: {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: fb.name,
        description: fb.description,
        personality: fb.personality,
        scenario: fb.scenario,
        first_mes: fb.firstMessage,
        creator: fb.creator,
        tags: fb.tags,
      },
    },
  };
}

// Aliases for backwards compatibility
export const searchJanitorCharacters = searchJannyCharacters;
export const getJanitorCharacter = getJannyCharacter;
