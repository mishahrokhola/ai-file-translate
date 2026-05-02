export type TranslateBookMeta = {
  context: string;
  progress: number; // 0-100
  lastChunk: number;
  chunkCount: number;
};
