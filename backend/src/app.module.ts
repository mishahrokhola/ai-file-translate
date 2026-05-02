import { Module } from '@nestjs/common';
import { GeminiService } from './ai/gemini.service';
import { ConfigModule } from '@nestjs/config';

import { FilesController } from './files/files.controller';
import { BooksController } from './books/books.controller';
import { TranslateController } from './translate/translate.controller';

import { FilesService } from './files/files.service';
import { BooksService } from './books/books.service';
import { TranslateService } from './translate/translate.service';
import { GoogleTranslateService } from './ai/google-translate.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [FilesController, TranslateController, BooksController],
  providers: [FilesService, TranslateService, BooksService, GeminiService, GoogleTranslateService],
})
export class AppModule {}
