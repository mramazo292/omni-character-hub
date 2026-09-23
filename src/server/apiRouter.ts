import { Router } from 'express';
import {
  searchDatacatCharacters,
  getDatacatCharacter,
  getDatacatTaxonomy,
} from './datacat.ts';
import {
  searchJanitorCharacters,
  getJanitorCharacter,
  JANITOR_TAGS,
} from './janitor.ts';
import {
  searchChubCharacters,
  getChubCharacter,
  CHUB_TAGS,
} from './chub.ts';

export const apiRouter = Router();

apiRouter.get('/status', async (_req, res) => {
  res.json({
    status: 'online',
    version: '2.0.0',
    connectors: {
      datacat: { available: true, authMode: 'session-token' },
      janitor: { available: true, authMode: 'archive-proxy' },
      chub: { available: true, authMode: 'public-gateway' },
      local: { available: true, mode: 'in-browser-storage' },
    },
  });
});

// Datacat endpoints
apiRouter.get('/datacat/characters', async (req, res) => {
  try {
    const search = req.query.search as string;
    const limit = parseInt(req.query.limit as string) || 30;
    const offset = parseInt(req.query.offset as string) || 0;
    const tagIds = req.query.tagIds as string;
    const sort = req.query.sort as string;

    const data = await searchDatacatCharacters({ search, limit, offset, tagIds, sort });
    
    // Normalize into canonical shape
    const characters = (data.characters || []).map((c: any) => ({
      id: c.characterId || c.character_id || c.id,
      sourceId: 'datacat',
      sourceName: 'Datacat',
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
      datacatMetadata: {
        contentHash: c.contentHash || c.content_hash,
        scorerBaseTotal: c.scorerBaseTotal || c.scorer_base_total,
        scorerNicheBonus: c.scorerNicheBonus || c.scorer_niche_bonus,
        scorerStatus: c.scorerStatus || c.scorer_status,
        hasJannyRecovery: Boolean(c.has_janny_recovery || c.hasJannyRecovery),
        recoveryBadgeText: c.recoveryBadgeText || c.recovery_badge_text,
        jannyaiRecoveryState: c.jannyaiRecoveryState || c.jannyai_recovery_state,
        hasDatacatReimagination: Boolean(c.hasDatacatReimagination || c.has_datacat_reimagination),
        tokenCounts: c.tokenCounts || c.token_counts,
        primaryContentSourceKind: c.primary_content_source_kind || c.primaryContentSourceKind,
        avatarVariantUrls: c.avatarVariantUrls || c.avatar_variant_urls,
      },
    }));

    res.json({
      success: true,
      count: characters.length,
      totalCount: data.totalCount || characters.length,
      hasMore: data.hasMore ?? false,
      characters,
    });
  } catch (err: any) {
    console.error('[API] Datacat search error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/datacat/character/:id', async (req, res) => {
  try {
    const data = await getDatacatCharacter(req.params.id);
    const c = data.character;
    if (!c) {
      return res.status(404).json({ success: false, error: 'Character not found' });
    }

    const character = {
      id: c.character_id || c.id,
      sourceId: 'datacat',
      sourceName: 'Datacat',
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
      datacatMetadata: {
        contentHash: c.content_hash,
        scorerBaseTotal: c.scorer_base_total,
        scorerNicheBonus: c.scorer_niche_bonus,
        scorerStatus: c.scorer_status,
        hasJannyRecovery: Boolean(c.has_janny_recovery),
        recoveryBadgeText: c.recovery_badge_text,
        jannyaiRecoveryState: c.jannyai_recovery_state,
        hasDatacatReimagination: Boolean(c.has_datacat_reimagination),
        tokenCounts: c.token_counts,
        primaryContentSourceKind: c.primary_content_source_kind,
        avatarVariantUrls: c.avatarVariantUrls || c.avatar_variant_urls,
      },
      rawCardData: c.chara_card_v2_json || null,
    };

    res.json({ success: true, character });
  } catch (err: any) {
    console.error('[API] Datacat get character error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/datacat/taxonomy', async (_req, res) => {
  try {
    const taxonomy = await getDatacatTaxonomy();
    res.json({ success: true, taxonomy });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Janitor endpoints
apiRouter.get('/janitor/characters', async (req, res) => {
  try {
    const search = req.query.search as string;
    const limit = parseInt(req.query.limit as string) || 30;
    const offset = parseInt(req.query.offset as string) || 0;
    const sort = req.query.sort as string;
    const tagId = req.query.tagId as string;

    const result = await searchJanitorCharacters({ search, limit, offset, sort, tagId });
    res.json(result);
  } catch (err: any) {
    console.error('[API] Janitor search error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/janitor/character/:id', async (req, res) => {
  try {
    const character = await getJanitorCharacter(req.params.id);
    res.json({ success: true, character });
  } catch (err: any) {
    console.error('[API] Janitor get character error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/janitor/tags', (_req, res) => {
  res.json({ success: true, tags: JANITOR_TAGS });
});

// Chub endpoints
apiRouter.get('/chub/characters', async (req, res) => {
  try {
    const search = req.query.search as string;
    const limit = parseInt(req.query.limit as string) || 30;
    const offset = parseInt(req.query.offset as string) || 0;
    const sort = req.query.sort as string;
    const tag = req.query.tag as string;

    const result = await searchChubCharacters({ search, limit, offset, sort, tag });
    res.json(result);
  } catch (err: any) {
    console.error('[API] Chub search error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/chub/character/:id', (req, res) => {
  try {
    const character = getChubCharacter(req.params.id);
    res.json({ success: true, character });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/chub/tags', (_req, res) => {
  res.json({ success: true, tags: CHUB_TAGS });
});

// Image proxy endpoint to bypass referrer restrictions
apiRouter.get('/proxy/image', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return res.status(400).send('Invalid url');
  }

  try {
    const imageRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!imageRes.ok) {
      return res.status(imageRes.status).send('Failed to fetch image');
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const buffer = await imageRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});
