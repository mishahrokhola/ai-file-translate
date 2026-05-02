import { Injectable } from '@nestjs/common';
import { translate } from 'google-translate-api-x';

@Injectable()
export class GoogleTranslateService {
  async translate(text: string): Promise<string> {
    const res = await translate(text, { from: 'en', to: 'uk' });

    return '\n\n(==== Переклад через Google Translate початок)' + res.text + '\n\n(==== Переклад через Google Translate кінець)';
  }
}
