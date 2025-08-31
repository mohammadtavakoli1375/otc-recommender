import { Module } from '@nestjs/common';
import { DoseCalculatorController } from './dose-calculator.controller';
import { DoseCalculatorService } from './dose-calculator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DoseCalculatorController],
  providers: [DoseCalculatorService],
  exports: [DoseCalculatorService],
})
export class DoseCalculatorModule {}