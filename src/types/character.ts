export type CharacterSource = 'datacat' | 'janny' | 'janitor' | 'chub' | 'local';

export interface BaseCharacter {
  id: string;
  sourceId: CharacterSource;
  sourceName: string;
  name: string;
  creator: string;
  creatorId?: string;
  description: string;
  rawDescription?: string;
  avatarUrl: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  isNsfw?: boolean;
  totalTokens?: number;
  firstMessage?: string;
  personality?: string;
  scenario?: string;
  exampleDialogue?: string;
  alternateGreetings?: string[];
}

export interface DatacatMetadata {
  contentHash?: string;
  scorerBaseTotal?: number;
  scorerNicheBonus?: number;
  scorerStatus?: string;
  hasJannyRecovery?: boolean;
  recoveryBadgeText?: string | null;
  jannyaiRecoveryState?: string;
  hasDatacatReimagination?: boolean;
  tokenCounts?: {
    total_tokens: number;
    scenario_tokens: number;
    personality_tokens: number;
    first_message_tokens: number;
    example_dialog_tokens?: number;
    permanent_tokens?: number | null;
  };
  primaryContentSourceKind?: string;
  avatarVariantUrls?: {
    thumb?: string;
    card?: string;
    hero?: string;
    original?: string;
  };
}

export interface JanitorMetadata {
  chatCount?: number;
  messageCount?: number;
  favoritesCount?: number;
  allowProxy?: boolean;
  isPublic?: boolean;
  definitionPublic?: boolean;
  personalityTokens?: number;
  permanentTokens?: number;
  firstMessageTokens?: number;
  customTags?: string[];
  janitorUserId?: string;
}

export interface ChubMetadata {
  starCount?: number;
  downloadCount?: number;
  rating?: number;
  forkCount?: number;
  specVersion?: 'v1' | 'v2' | 'v3';
  expressionsCount?: number;
  hasLorebook?: boolean;
  lorebookName?: string;
  fullPath?: string;
}

export interface LocalMetadata {
  importedAt: string;
  originalFileName: string;
  sourceSpace: string;
  customNotes?: string;
  isFavorite?: boolean;
}

export interface CharacterItem extends BaseCharacter {
  datacatMetadata?: DatacatMetadata;
  janitorMetadata?: JanitorMetadata;
  chubMetadata?: ChubMetadata;
  localMetadata?: LocalMetadata;
  rawCardData?: Record<string, unknown>;
}

export interface SourceFacet {
  id: string | number;
  name: string;
  slug: string;
  tags: { id: string | number; name: string; slug: string; count?: number }[];
}

export interface SearchFilters {
  query: string;
  selectedTags: string[];
  tagMatchMode: 'and' | 'or';
  sortBy: string;
  nsfw: boolean;
  page: number;
  limit: number;
}
