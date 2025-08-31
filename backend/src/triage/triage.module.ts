import { Module } from '@nestjs/common';
import { TriageController } from './triage.controller';
import { TriageService } from './triage.service';
import { PrismaService } from '../prisma/prisma.service';
import { RulesEngine } from '../rules/rules-engine';

@Module({
  controllers: [TriageController],
  providers: [TriageService, PrismaService, RulesEngine],
})
export class TriageModule {}