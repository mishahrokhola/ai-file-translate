import { splitTextIntoBigChunks } from './text.utils';

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
