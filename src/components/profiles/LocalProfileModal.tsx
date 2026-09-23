import React, { useState } from 'react';
import {
  X,
  BookmarkCheck,
  Star,
  Download,
  Trash2,
  Save,
  Tag,
  Folder,
  Edit3,
  Bot,
} from 'lucide-react';
import { CharacterItem } from '../../types/character.ts';
import { exportCharacterAsJson } from '../../utils/cardParser.ts';

interface LocalProfileModalProps {
  character: CharacterItem;
  onClose: () => void;
  onUpdate: (updated: CharacterItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  availableSpaces: string[];
}

export const LocalProfileModal: React.FC<LocalProfileModalProps> = ({
  character,
  onClose,
  onUpdate,
  onDelete,
  onToggleFavorite,
  availableSpaces,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(character.name);
  const [creator, setCreator] = useState(character.creator);
  const [description, setDescription] = useState(character.description);
  const [firstMessage, setFirstMessage] = useState(character.firstMessage || '');
  const [personality, setPersonality] = useState(character.personality || '');
  const [scenario, setScenario] = useState(character.scenario || '');
  const [sourceSpace, setSourceSpace] = useState(character.localMetadata?.sourceSpace || 'My Archive');
  const [customSpace, setCustomSpace] = useState('');

  const handleSave = () => {
    const space = customSpace.trim() || sourceSpace;
    const updated: CharacterItem = {
      ...character,
      name,
      creator,
      description,
      firstMessage,
      personality,
      scenario,
      localMetadata: {
        ...(character.localMetadata || {
          importedAt: new Date().toISOString(),
          originalFileName: 'card.json',
        }),
        sourceSpace: space,
      },
    };
    onUpdate(updated);
    setIsEditing(false);
  };

  const isFav = character.localMetadata?.isFavorite;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-amber-900/40 bg-[#0e0c0a] text-neutral-100 shadow-2xl ring-1 ring-white/10">
        {/* Banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950">
          {character.avatarUrl && (
            <img
              src={character.avatarUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-20 scale-125"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c0a] via-[#0e0c0a]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Space Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/80 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md shadow-sm">
            <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Local Archive Space: {character.localMetadata?.sourceSpace || 'My Archive'}</span>
          </div>

          {/* Avatar & Title */}
          <div className="absolute bottom-4 left-6 flex items-end gap-5">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-neutral-900 shadow-xl">
              {character.avatarUrl ? (
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-amber-950 text-amber-300">
                  <Bot className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="pb-1">
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-amber-500/40 bg-neutral-950 px-3 py-1 text-lg font-bold text-white focus:outline-none"
                />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                  {character.name}
                </h2>
              )}
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                {isEditing ? (
                  <input
                    type="text"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    className="rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-xs text-neutral-300"
                    placeholder="Creator name"
                  />
                ) : (
                  <span>by @{character.creator}</span>
                )}
                <span>•</span>
                <span className="text-amber-400">Imported into Library</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Space Assignment */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Folder className="h-4 w-4" />
              <span>Library Space:</span>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <select
                  value={sourceSpace}
                  onChange={(e) => setSourceSpace(e.target.value)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200"
                >
                  {availableSpaces.filter((s) => s !== 'All').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="new">+ Create New Space...</option>
                </select>
                {sourceSpace === 'new' && (
                  <input
                    type="text"
                    placeholder="Space Name"
                    value={customSpace}
                    onChange={(e) => setCustomSpace(e.target.value)}
                    className="rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200"
                  />
                )}
              </div>
            ) : (
              <span className="rounded-md bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-300 border border-amber-500/20">
                {character.localMetadata?.sourceSpace || 'My Archive'}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Character Description
            </h4>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            ) : (
              <p className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-relaxed text-neutral-200">
                {character.description || 'No description.'}
              </p>
            )}
          </div>

          {/* First Message */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              First Message
            </h4>
            {isEditing ? (
              <textarea
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
            ) : (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-relaxed text-neutral-200 whitespace-pre-wrap">
                {character.firstMessage || 'No first message.'}
              </div>
            )}
          </div>

          {/* Personality & Scenario */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Personality & Scenario
            </h4>
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Personality"
                  rows={3}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                />
                <textarea
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="Scenario"
                  rows={2}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {character.personality && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs font-mono text-amber-200/90 whitespace-pre-wrap">
                    {character.personality}
                  </div>
                )}
                {character.scenario && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs font-mono text-neutral-300 whitespace-pre-wrap">
                    {character.scenario}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 bg-neutral-950/90 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(character.id)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                isFav
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                  : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
              <span>{isFav ? 'Favorited' : 'Favorite'}</span>
            </button>

            <button
              onClick={() => exportCharacterAsJson(character)}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Delete this character from your library?')) {
                  onDelete(character.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-rose-900/40 bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-900/40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-500 transition-all"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-800 transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Card</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
