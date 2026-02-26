export function getErrorMessage(error: unknown): string | null {
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message as string | null;
  }

  return error as string;
}
