import { parse, join } from 'path';

export function storagePath(...parts: string[]): string {
  return join(process.cwd(), 'storage', ...parts);
}

export function uploadsPath(...parts: string[]): string {
  return storagePath('uploads', ...parts);
}

export function translatedPath(...parts: string[]): string {
  return storagePath('translated', ...parts);
}

export function getTranslatedFilename(filename: string): string {
  const fileInfo = parse(filename);

  return `${fileInfo.name}_ua${fileInfo.ext}`;
}

export function getMarkedTranslatedFilename(filename: string): string {
  const fileInfo = parse(filename);

  return `${fileInfo.name}_marked_ua${fileInfo.ext}`;
}
