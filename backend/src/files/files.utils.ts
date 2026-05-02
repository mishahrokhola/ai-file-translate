import { parse, join } from 'path';

export function storagePath(...parts: string[]): string {
  return join(process.cwd(), 'storage', ...parts);
}

export function booksPath(...parts: string[]): string {
  return storagePath('books', ...parts);
}

export function userBooksPath(userId: number, ...parts: string[]): string {
  return booksPath(`user-${userId}`, ...parts);
}

export function userBookFolderPath(userId: number, filename: string, ...parts: string[]): string {
  return userBooksPath(userId, filename, ...parts);
}

export function getTranslatedFilename(filename: string): string {
  const fileInfo = parse(filename);

  return `${fileInfo.name}.ua${fileInfo.ext}`;
}

export function getMarkedFilename(filename: string): string {
  const fileInfo = parse(filename);

  return `${fileInfo.name}.ua.marked${fileInfo.ext}`;
}

export function getFilenameByVariant(filename: string, variant: 'original' | 'translated' | 'marked'): string {
  switch (variant) {
    case 'original':
      return filename;
    case 'translated':
      return getTranslatedFilename(filename);
    case 'marked':
      return getMarkedFilename(filename);
  }
}
