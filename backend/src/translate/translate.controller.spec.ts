import { Test, TestingModule } from '@nestjs/testing';

import { GeminiService } from 'src/ai/gemini.service';
import { TranslateController } from './translate.controller';

import { HousePotterFor, expectedChunk1, expectedChunk2, expectedChunk3, expectedChunk4, expectedChunk5 } from './text.mocks';

const mockGeminiService = {
  translateLargeBook: jest.fn(),
};

describe('TranslateController', () => {
  let service: TranslateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TranslateController, { provide: GeminiService, useValue: mockGeminiService }],
    }).compile();

    service = module.get<TranslateController>(TranslateController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('splitTextIntoBigChunks', () => {
    it('should split real book part', () => {
      const chunks = service.splitTextIntoBigChunks(HousePotterFor);

      expect(chunks.length).toEqual(5);
      expect(chunks[0]).toEqual(expectedChunk1);
      expect(chunks[1]).toEqual(expectedChunk2);
      expect(chunks[2]).toEqual(expectedChunk3);
      expect(chunks[3]).toEqual(expectedChunk4);
      expect(chunks[4]).toEqual(expectedChunk5);
    });
  });
});
