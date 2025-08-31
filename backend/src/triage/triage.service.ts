import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RulesEngine } from '../rules/rules-engine';
import { TriageDto } from './dto/triage.dto';
import { TriageInput, TriageOutput } from '../rules/types';

@Injectable()
export class TriageService {
  constructor(
    private prisma: PrismaService,
    private rulesEngine: RulesEngine,
  ) {}

  async evaluateSymptoms(triageDto: TriageDto): Promise<TriageOutput> {
    // Convert DTO to internal format
    const input: TriageInput = {
      patient: {
        age: triageDto.patient.age,
        sex: triageDto.patient.sex,
        pregnantWeeks: triageDto.patient.pregnantWeeks,
        isElder: triageDto.patient.age >= 65,
        meds: triageDto.patient.meds,
      },
      symptoms: triageDto.symptoms,
      durationDays: triageDto.durationDays,
      redFlags: triageDto.redFlags,
    };

    // Evaluate using new rules engine with OTC dataset
    const result = this.rulesEngine.evaluateProtocol(input);
    
    return result;
  }

  async getIngredients() {
    return this.prisma.ingredient.findMany({
      where: { otc_bool: true },
      orderBy: { name: 'asc' },
    });
  }

  async getLatestProtocol(conditionSlug: string) {
    const condition = await this.prisma.condition.findUnique({
      where: { slug: conditionSlug },
      include: {
        protocols: {
          where: { published_at: { not: null } },
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            recommendations: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (!condition) {
      throw new NotFoundException('Condition not found');
    }

    return condition;
  }

  // حذف شده - دیگر نیازی به تعیین condition و rules نداریم
  // موتور قوانین جدید مستقیماً از دیتاست OTC استفاده می‌کند
}