import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

import { storagePath, translatedPath, uploadsPath } from './files/files.utils';

async function bootstrap() {
  const folders = [storagePath(), uploadsPath(), translatedPath()]; // order is important
  folders.forEach((dir) => !fs.existsSync(dir) && fs.mkdirSync(dir)); // create require dirs if not exist

  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
