import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

import { booksPath, storagePath } from './files/files.utils';

async function bootstrap() {
  const folders = [storagePath(), booksPath()]; // order is important
  folders.forEach((dir) => !fs.existsSync(dir) && fs.mkdirSync(dir)); // create require dirs if not exist

  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder().setTitle('API').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
