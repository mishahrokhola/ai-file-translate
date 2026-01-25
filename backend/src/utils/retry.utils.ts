export async function withRetry<T>(
  task: () => Promise<T>,
  retries = 3,
  delayMs = 1000,
  backoff = true,
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await task();
    } catch (error: unknown) {
      lastError = error;

      const isOverloaded =
        isCoomonError(error) &&
        (error.message?.includes('503') ||
          error.message?.includes('overloaded'));

      if (!isOverloaded || i === retries - 1) {
        throw error;
      }

      const waitTime = backoff ? delayMs * Math.pow(2, i) : delayMs;
      console.warn(
        `[Retry] Спроба ${i + 1} не вдалася (503). Чекаємо ${waitTime}ms...`,
      );

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

function isCoomonError(error: unknown): error is { message: string } {
  return !!error && typeof error === 'object' && 'message' in error;
}
