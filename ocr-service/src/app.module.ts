import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfParserModule } from './pdf-parser/pdf-parser.module';

@Module({
  imports: [PdfParserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
