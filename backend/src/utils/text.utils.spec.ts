import { splitTextIntoBigChunks, cleanMarkedTags } from './text.utils';

import { HousePotterFor, expectedChunk1, expectedChunk2, expectedChunk3, expectedChunk4, expectedChunk5 } from './text.utils.mock';

describe('splitTextIntoBigChunks', () => {
  it('should split real book part', () => {
    const chunks = splitTextIntoBigChunks(HousePotterFor);

    expect(chunks.length).toEqual(5);
    expect(chunks[0]).toEqual(expectedChunk1);
    expect(chunks[1]).toEqual(expectedChunk2);
    expect(chunks[2]).toEqual(expectedChunk3);
    expect(chunks[3]).toEqual(expectedChunk4);
    expect(chunks[4]).toEqual(expectedChunk5);
  });
});

describe('cleanMarkedTags', () => {
  it('should remove a single tag with all attributes', () => {
    const input = '<v n="Snape" m="sarcastic">Always.</v>';
    expect(cleanMarkedTags(input)).toBe('Always.');
  });

  it('should remove multiple tags from a string', () => {
    const input = '<v n="Harry" m="excited">Привіт!</v> <v n="Ron" m="neutral">Як справи?</v>';
    expect(cleanMarkedTags(input)).toBe('Привіт! Як справи?');
  });

  it('should handle text without any tags', () => {
    const input = 'Просто звичайний текст без розмітки.';
    expect(cleanMarkedTags(input)).toBe('Просто звичайний текст без розмітки.');
  });

  it('should work with different mood attributes', () => {
    const input = '<v n="Hermione" m="whisper">Тихіше...</v>';
    expect(cleanMarkedTags(input)).toBe('Тихіше...');
  });

  it('should trim whitespace from the edges', () => {
    const input = '   <v n="Dobby" m="sad">Доббі вільний!</v>   ';
    expect(cleanMarkedTags(input)).toBe('Доббі вільний!');
  });

  it('should handle multiline text with tags', () => {
    const input = `
      <v n="Dumbledore" m="neutral">Це було важливо.</v>
      Він посміхнувся.
    `;

    expect(cleanMarkedTags(input)).toBe(`Це було важливо.
      Він посміхнувся.`);
  });
});
