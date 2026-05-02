import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Controller, Sse, Query, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';

import { User } from '../decorators/user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { ErrorResultDto } from '../dto/result.dto';
import { TranslateQueryDto } from 'src/translate/translate.query.dto';
import { TranslateBookDataDto, TranslateBookDoneDto, TranslateBookResultDto } from './translate-book.dto';

import { TranslateService } from './translate.service';

@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Sse('stream')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiExtraModels(TranslateBookDataDto, TranslateBookDoneDto, TranslateBookResultDto, ErrorResultDto)
  @ApiOkResponse({
    description: 'Потік подій перекладу (SSE)',
    schema: { oneOf: [{ $ref: getSchemaPath(TranslateBookDataDto) }, { $ref: getSchemaPath(TranslateBookDoneDto) }] },
  })
  stream(@User('id') userId: number, @Query() query: TranslateQueryDto): Observable<{ data: TranslateBookDataDto | TranslateBookDoneDto }> {
    return this.translateService.getStream(userId, query);
  }
}
