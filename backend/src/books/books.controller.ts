import { Controller, Get, Param, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { existsSync } from 'fs';

import { User } from '../decorators/user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { BookDto } from './book.dto';
import { BooksService } from './books.service';

import { userBookFolderPath, userBooksPath } from '../files/files.utils';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Список книг', type: [BookDto] })
  list(@User('id') userId: number): BookDto[] {
    const dir = userBooksPath(userId);

    return existsSync(dir) ? this.booksService.getList(userId) : [];
  }

  @Get(':filename')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Одна книга', type: BookDto })
  item(@User('id') userId: number, @Param('filename') filename: string): BookDto {
    const filePath = userBookFolderPath(userId, filename, filename);

    if (!existsSync(filePath)) {
      throw new BadRequestException('Файл ще не готовий або не існує');
    }

    return this.booksService.getItem(userId, filename);
  }

  @Delete(':filename')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Видалити файл і його переклади' })
  delete(@User('id') userId: number, @Param('filename') filename: string): void {
    return this.booksService.deleteItem(userId, filename);
  }
}
