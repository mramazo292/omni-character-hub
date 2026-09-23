import React, { useState } from 'react';
import {
  MessageSquare,
  MessagesSquare,
  Sparkles,
  Star,
  Download,
  ShieldCheck,
  CheckCircle,
  Database,
  Cpu,
  Bookmark,
  ExternalLink,
  Bot,
} from 'lucide-react';
import { CharacterItem } from '../types/character.ts';

interface CharacterCardProps {
  character: CharacterItem;
  onSelect: (character: CharacterItem) => void;
  onSaveToLibrary?: (character: CharacterItem) => void;
  onToggleFavorite?: (id: string) => void;
  isSaved?: boolean;
  density?: 'comfortable' | 'compact';
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  onSaveToLibrary,
  onToggleFavorite,
  isSaved = false,
  density = 'comfortable',
}) => {
  const [imageError, setImageError] = useState(false);

  // Derive source-specific theme accents
  const getSourceStyles = () => {
    switch (character.sourceId) {
      case 'datacat':
        return {
          border: 'border-neutral-800 hover:border-sky-500/50 hover:shadow-sky-500/10',
          badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          accent: 'text-sky-400',
        };
      case 'janitor':
        return {
          border: 'border-neutral-800 hover:border-indigo-500/50 hover:shadow-indigo-500/10',
          badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          accent: 'text-indigo-400',
        };
      case 'chub':
        return {
          border: 'border-neutral-800 hover:border-emerald-500/50 hover:shadow-emerald-500/10',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          accent: 'text-emerald-400',
        };
      case 'local':
        return {
          border: 'border-neutral-800 hover:border-amber-500/50 hover:shadow-amber-500/10',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          accent: 'text-amber-400',
        };
    }
  };

  const style = getSourceStyles();

  // Format large numbers cleanly (e.g. 12400 -> 12.4k)
  const formatNum = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div
      onClick={() => onSelect(character)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-neutral-900/80 backdrop-blur-md shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${style.border}`}
    >
      {/* Top Media / Avatar Section */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
        {!imageError && character.avatarUrl ? (
          <img
            src={character.avatarUrl}
            alt={character.name}
            onError={() => setImageError(true)}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 text-neutral-600">
            <Bot className="h-14 w-14 mb-2 opacity-50" />
            <span className="text-xs font-medium text-neutral-500">No Image</span>
          </div>
        )}

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80" />

        {/* Top Floating Source Badge & Actions */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          <div className={`pointer-events-auto flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-md ${style.badge}`}>
            <span>{character.sourceName}</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Local Favorite Star */}
            {character.sourceId === 'local' && onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(character.id);
                }}
                className={`rounded-full p-1.5 backdrop-blur-md transition-all ${
                  character.localMetadata?.isFavorite
                    ? 'bg-amber-500/90 text-white shadow-md shadow-amber-500/30'
                    : 'bg-neutral-900/80 text-neutral-400 hover:text-white'
                }`}
              >
                <Star className="h-3.5 w-3.5 fill-current" />
              </button>
            )}

            {/* Quick Add to Library Button */}
            {character.sourceId !== 'local' && onSaveToLibrary && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveToLibrary(character);
                }}
                title={isSaved ? 'In your library' : 'Save to library'}
                className={`rounded-full p-1.5 backdrop-blur-md transition-all ${
                  isSaved
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-neutral-900/80 text-neutral-400 hover:bg-indigo-600 hover:text-white'
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Avatar Overlay: Source-Specific Metrics */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[11px] font-medium text-neutral-300 pointer-events-none">
          {/* Janitor AI Specific Metrics */}
          {character.sourceId === 'janitor' && character.janitorMetadata && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-neutral-950/80 px-2 py-0.5 backdrop-blur-sm ring-1 ring-white/10">
                <MessagesSquare className="h-3 w-3 text-indigo-400" />
                {formatNum(character.janitorMetadata.chatCount)}
              </span>
              {character.janitorMetadata.allowProxy && (
                <span className="flex items-center gap-1 rounded-md bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 ring-1 ring-emerald-500/30 text-[10px]">
                  Proxy
                </span>
              )}
            </div>
          )}

          {/* Datacat Specific Metrics */}
          {character.sourceId === 'datacat' && character.datacatMetadata && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-neutral-950/80 px-2 py-0.5 backdrop-blur-sm ring-1 ring-white/10">
                <Cpu className="h-3 w-3 text-sky-400" />
                {formatNum(character.totalTokens)} tok
              </span>
              {character.datacatMetadata.scorerBaseTotal ? (
                <span className="rounded-md bg-sky-500/20 text-sky-300 px-1.5 py-0.5 ring-1 ring-sky-500/30 text-[10px]">
                  Score {character.datacatMetadata.scorerBaseTotal}
                </span>
              ) : null}
            </div>
          )}

          {/* Chub Specific Metrics */}
          {character.sourceId === 'chub' && character.chubMetadata && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-neutral-950/80 px-2 py-0.5 backdrop-blur-sm ring-1 ring-white/10">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                {character.chubMetadata.starCount ? formatNum(character.chubMetadata.starCount) : '4.9'}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-neutral-950/80 px-2 py-0.5 backdrop-blur-sm ring-1 ring-white/10">
                <Download className="h-3 w-3 text-emerald-400" />
                {formatNum(character.chubMetadata.downloadCount)}
              </span>
            </div>
          )}

          {/* Local Library Metric */}
          {character.sourceId === 'local' && character.localMetadata && (
            <span className="rounded-md bg-amber-500/20 text-amber-300 px-2 py-0.5 ring-1 ring-amber-500/30 text-[10px]">
              {character.localMetadata.sourceSpace || 'Default Space'}
            </span>
          )}

          {/* Total Token Count Indicator */}
          {character.totalTokens ? (
            <span className="text-[10px] text-neutral-400 ml-auto bg-neutral-950/80 px-1.5 py-0.5 rounded backdrop-blur-sm">
              {formatNum(character.totalTokens)} t
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Content Section */}
      <div className={`flex flex-col justify-between flex-1 ${density === 'comfortable' ? 'p-4' : 'p-3'}`}>
        <div>
          {/* Character Name */}
          <h3 className="font-bold text-sm text-neutral-100 line-clamp-1 group-hover:text-white transition-colors">
            {character.name}
          </h3>

          {/* Creator Attribution */}
          <p className="mt-0.5 text-xs text-neutral-400 line-clamp-1">
            by <span className="text-neutral-300 font-medium">@{character.creator}</span>
          </p>

          {/* Description */}
          {density === 'comfortable' && character.description && (
            <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
              {character.description}
            </p>
          )}
        </div>

        {/* Tags Row */}
        {character.tags && character.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {character.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md border border-neutral-800 bg-neutral-950/60 px-2 py-0.5 text-[10px] font-medium text-neutral-400"
              >
                {tag}
              </span>
            ))}
            {character.tags.length > 3 && (
              <span className="rounded-md border border-neutral-800 bg-neutral-950/40 px-1.5 py-0.5 text-[10px] text-neutral-500">
                +{character.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
