/**
 * Розбиває текст на великі частини, намагаючись не розривати абзаци.
 * @param text Повний текст файлу
 * @param maxChars Максимальна кількість символів у чанку (напр. 10000)
 * @param minChars Мінімальна кількість символів у чанку
 */
export function splitTextIntoBigChunks(text: string, maxChars = 15000, minChars = 500): string[] {
  const chunks: string[] = [];

  let currentIndex = 0;

  while (currentIndex < text.length) {
    let chunkEnd = currentIndex + maxChars;

    if (chunkEnd < text.length) {
      // 1. Шукаємо ідеальний розрив (два переноси рядка)
      let splitIndex = text.lastIndexOf('\n\n', chunkEnd);

      // 2. Якщо не знайшли \n\n у нашому вікні, шукаємо одиночний \n
      if (splitIndex <= currentIndex + minChars) {
        splitIndex = text.lastIndexOf('\n', chunkEnd);
      }

      // 3. Якщо і рядків немає (стіна тексту), шукаємо кінець речення
      if (splitIndex <= currentIndex + minChars) {
        splitIndex = text.lastIndexOf('. ', chunkEnd);

        if (splitIndex !== -1) splitIndex += 1; // Щоб крапка залишилась у поточному чанку
      }

      // Якщо знайшли хоч якийсь адекватний розрив — використовуємо його
      if (splitIndex > currentIndex + minChars) {
        chunkEnd = splitIndex;
      }
    }

    const chunk = text.substring(currentIndex, chunkEnd).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    currentIndex = chunkEnd;
  }

  return chunks;
}

/**
 * Видаляє всі теги типу <v n="..."> та </v>
 */
export function cleanMarkedTags(text: string): string {
  return text.replace(/<v n=".*?">|<\/v>/g, '').trim();
}
