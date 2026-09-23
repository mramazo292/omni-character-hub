import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileCode,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  FolderPlus,
  ArrowRight,
} from 'lucide-react';
import { CharacterItem } from '../types/character.ts';
import { parsePngCard, normalizeParsedCard } from '../utils/cardParser.ts';

interface ImportModalProps {
  onClose: () => void;
  onImportSuccess: (character: CharacterItem) => void;
  existingSpaces: string[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  onClose,
  onImportSuccess,
  existingSpaces,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedCard, setParsedCard] = useState<Partial<CharacterItem> | null>(null);
  const [sourceSpace, setSourceSpace] = useState('My Archive');
  const [customSpace, setCustomSpace] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);

    try {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text);
        const card = normalizeParsedCard(json, file.name);
        setParsedCard(card);
      } else if (file.type === 'image/png' || file.name.endsWith('.png')) {
        const card = await parsePngCard(file);
        setParsedCard(card);

        // Create preview URL for the image
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
      } else {
        throw new Error('Please upload a .json, .png Tavern card, or .charx file');
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setErrorMsg(err.message || 'Failed to read character card file');
      setParsedCard(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedCard || !parsedCard.name) return;

    const space = customSpace.trim() || sourceSpace;
    const finalCharacter: CharacterItem = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sourceId: 'local',
      sourceName: 'My Library',
      name: parsedCard.name,
      creator: parsedCard.creator || 'Imported Creator',
      description: parsedCard.description || '',
      avatarUrl: avatarPreview || parsedCard.avatarUrl || '',
      tags: parsedCard.tags || ['Imported'],
      firstMessage: parsedCard.firstMessage || '',
      personality: parsedCard.personality || '',
      scenario: parsedCard.scenario || '',
      exampleDialogue: parsedCard.exampleDialogue || '',
      totalTokens: parsedCard.totalTokens || 0,
      localMetadata: {
        importedAt: new Date().toISOString(),
        originalFileName: fileName || 'card.json',
        sourceSpace: space,
        isFavorite: false,
      },
      rawCardData: parsedCard.rawCardData,
    };

    onImportSuccess(finalCharacter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-xl overflow-hidden rounded-3xl border border-neutral-800 bg-[#0d0f14] text-neutral-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Import Character Card</h3>
              <p className="text-xs text-neutral-400">
                Supports .json, .png (Tavern embedded), and .charx
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.png,.charx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-indigo-400 mb-3 shadow-inner">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-200">
              Click to select or drag and drop character file
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              PNG cards with embedded chara chunk, or standard JSON cards
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-900/40 bg-rose-950/30 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Card Preview */}
          {parsedCard && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  Successfully Parsed Card
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">{fileName}</span>
              </div>

              <div className="flex items-start gap-4 pt-1">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover border border-neutral-700 flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-900 text-neutral-500 border border-neutral-800 flex-shrink-0">
                    <FileCode className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-white">{parsedCard.name}</h4>
                  <p className="text-xs text-neutral-400">by @{parsedCard.creator}</p>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                    {parsedCard.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Space Selection */}
              <div className="pt-2 border-t border-neutral-900">
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Assign to Library Space
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={sourceSpace}
                    onChange={(e) => setSourceSpace(e.target.value)}
                    className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                  >
                    {existingSpaces.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="new">+ Custom Space...</option>
                  </select>
                  {sourceSpace === 'new' && (
                    <input
                      type="text"
                      placeholder="e.g. Cyberpunk Archive"
                      value={customSpace}
                      onChange={(e) => setCustomSpace(e.target.value)}
                      className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 bg-neutral-950/80 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!parsedCard}
            onClick={handleConfirmImport}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span>Import to Library</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
