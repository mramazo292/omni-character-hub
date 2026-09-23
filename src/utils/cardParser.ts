import { CharacterItem } from '../types/character.ts';

/**
 * Extracts character data from a Tavern PNG card (tEXt or zTXt chunk named "chara")
 */
export async function parsePngCard(file: File): Promise<Partial<CharacterItem>> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check PNG signature: 137 80 78 71 13 10 26 10
  if (
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47
  ) {
    throw new Error('Not a valid PNG file');
  }

  let offset = 8;
  const view = new DataView(buffer);

  while (offset < bytes.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7]
    );

    if (type === 'tEXt') {
      const chunkData = bytes.slice(offset + 8, offset + 8 + length);
      let nullIndex = -1;
      for (let i = 0; i < chunkData.length; i++) {
        if (chunkData[i] === 0) {
          nullIndex = i;
          break;
        }
      }

      if (nullIndex !== -1) {
        const keyword = new TextDecoder('latin1').decode(chunkData.slice(0, nullIndex));
        if (keyword === 'chara' || keyword === 'ccv3') {
          const rawText = new TextDecoder('latin1').decode(chunkData.slice(nullIndex + 1));
          try {
            // Base64 decode
            const jsonStr = decodeURIComponent(escape(atob(rawText)));
            const parsed = JSON.parse(jsonStr);
            return normalizeParsedCard(parsed, file.name);
          } catch (e) {
            // Try direct JSON
            try {
              const parsed = JSON.parse(rawText);
              return normalizeParsedCard(parsed, file.name);
            } catch (_) {}
          }
        }
      }
    }

    // Move to next chunk: length + 4 (type) + 4 (crc)
    offset += 8 + length + 4;
  }

  throw new Error('No character metadata chunk found in PNG');
}

/**
 * Normalizes different character formats into CharacterItem
 */
export function normalizeParsedCard(data: any, fileName: string): Partial<CharacterItem> {
  // Tavern V2 spec
  if (data.spec === 'chara_card_v2' && data.data) {
    const d = data.data;
    return {
      name: d.name || fileName.replace(/\.[^/.]+$/, ''),
      creator: d.creator || 'Imported',
      description: d.description || '',
      personality: d.personality || '',
      scenario: d.scenario || '',
      firstMessage: d.first_mes || '',
      exampleDialogue: d.mes_example || '',
      alternateGreetings: d.alternate_greetings || [],
      tags: Array.isArray(d.tags) ? d.tags : [],
      rawCardData: data,
    };
  }

  // Tavern V1 spec / Character AI export
  if (data.name) {
    return {
      name: data.name,
      creator: data.creator || 'Imported',
      description: data.description || '',
      personality: data.personality || '',
      scenario: data.scenario || '',
      firstMessage: data.first_mes || data.first_message || '',
      exampleDialogue: data.mes_example || data.example_dialogue || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      rawCardData: data,
    };
  }

  throw new Error('Unrecognized character card format');
}

/**
 * Downloads a character as a standard Tavern V2 JSON file
 */
export function exportCharacterAsJson(character: CharacterItem) {
  const exportPayload = {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: character.name,
      description: character.description,
      personality: character.personality || '',
      scenario: character.scenario || '',
      first_mes: character.firstMessage || '',
      mes_example: character.exampleDialogue || '',
      creator: character.creator,
      character_version: '1.0',
      tags: character.tags,
      alternate_greetings: character.alternateGreetings || [],
      extensions: {
        omni_character_hub: {
          sourceId: character.sourceId,
          sourceName: character.sourceName,
          imported_at: new Date().toISOString(),
          original_id: character.id,
        },
      },
    },
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_card.json`;
  a.click();
  URL.revokeObjectURL(url);
}
