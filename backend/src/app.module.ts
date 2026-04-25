import { Module } from '@nestjs/common';
import { GeminiService } from './ai/gemini.service';
import { ConfigModule } from '@nestjs/config';

import { FilesController } from './files/files.controller';
import { TranslateController } from './translate/translate.controller';
import { GoogleTranslateService } from './ai/google-translate.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [FilesController, TranslateController],
  providers: [GeminiService, GoogleTranslateService],
})
export class AppModule {}
