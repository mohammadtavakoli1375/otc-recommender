import { Module } from '@nestjs/common';
import { EducationalContentService } from './educational-content.service';
import { EducationalContentController } from './educational-content.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EducationalContentController],
  providers: [EducationalContentService],
  exports: [EducationalContentService],
})
export class EducationalContentModule {}