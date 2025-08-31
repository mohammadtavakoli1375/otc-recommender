import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculateDoseDto, DoseCalculationResultDto } from './dto/calculate-dose.dto';
import { AgeGroup } from '@prisma/client';

@Injectable()
export class DoseCalculatorService {
  constructor(private prisma: PrismaService) {}

  async calculateDose(dto: CalculateDoseDto, clientIp?: string, userId?: string): Promise<DoseCalculationResultDto> {
    // Get drug information
    const drug = await this.prisma.drug.findUnique({
      where: { id: dto.drugId },
    });

    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    // Determine age group
    const ageGroup = this.determineAgeGroup(dto.ageYears, dto.ageMonths);

    // Validate age and weight
    this.validatePatientData(dto, drug);

    // Calculate dose based on age group
    const calculatedDoseMg = this.calculateDoseByAgeGroup(
      ageGroup,
      dto.weightKg,
      drug
    );

    // Perform safety checks
    const safetyResult = this.performSafetyChecks(
      calculatedDoseMg,
      drug,
      dto.ageYears,
      dto.weightKg
    );

    // Calculate total daily dose
    const totalDailyDoseMg = calculatedDoseMg * drug.max_doses_per_day;

    // Generate calculation notes
    const calculationNotes = this.generateCalculationNotes(
      ageGroup,
      dto.weightKg,
      calculatedDoseMg,
      drug
    );

    // Save calculation to database
    const calculation = await this.prisma.doseCalculation.create({
      data: {
        drug_id: dto.drugId,
        user_id: userId,
        patient_age_years: dto.ageYears,
        patient_age_months: dto.ageMonths,
        patient_weight_kg: dto.weightKg,
        age_group: ageGroup,
        calculated_dose_mg: calculatedDoseMg,
        doses_per_day: drug.max_doses_per_day,
        total_daily_dose_mg: totalDailyDoseMg,
        is_safe: safetyResult.isSafe,
        safety_warnings: JSON.stringify(safetyResult.warnings),
        calculation_notes: calculationNotes,
        calculated_by: clientIp || 'unknown',
      },
    });

    return {
      calculatedDoseMg,
      dosesPerDay: drug.max_doses_per_day,
      totalDailyDoseMg,
      ageGroup,
      isSafe: safetyResult.isSafe,
      safetyWarnings: safetyResult.warnings,
      calculationNotes,
      drug: {
        id: drug.id,
        nameFa: drug.name_fa,
        nameEn: drug.name_en,
        genericName: drug.generic_name,
      },
    };
  }

  private determineAgeGroup(ageYears: number, ageMonths: number): AgeGroup {
    if (ageYears < 2) {
      return AgeGroup.INFANT;
    } else if (ageYears < 12) {
      return AgeGroup.CHILD;
    } else {
      return AgeGroup.ADULT;
    }
  }

  private validatePatientData(dto: CalculateDoseDto, drug: any): void {
    // Calculate total age in months
    const totalAgeMonths = (dto.ageYears * 12) + dto.ageMonths;
    
    // Check minimum age
    if (drug.min_age_months && totalAgeMonths < drug.min_age_months) {
      throw new BadRequestException(
        `این دارو برای کودکان زیر ${drug.min_age_months} ماه مناسب نیست`
      );
    }

    // Check maximum age
    if (drug.max_age_years && dto.ageYears > drug.max_age_years) {
      throw new BadRequestException(
        `این دارو برای افراد بالای ${drug.max_age_years} سال توصیه نمی‌شود`
      );
    }

    // Basic weight validation
    if (dto.weightKg < 2 || dto.weightKg > 200) {
      throw new BadRequestException('وزن وارد شده در محدوده مجاز نیست');
    }
  }

  private calculateDoseByAgeGroup(
    ageGroup: AgeGroup,
    weightKg: number,
    drug: any
  ): number {
    let calculatedDose: number;

    switch (ageGroup) {
      case AgeGroup.INFANT:
        if (!drug.infant_dose_mg_kg) {
          throw new BadRequestException('دوز برای خردسالان تعریف نشده است');
        }
        calculatedDose = drug.infant_dose_mg_kg * weightKg;
        break;

      case AgeGroup.CHILD:
        if (!drug.child_dose_mg_kg) {
          throw new BadRequestException('دوز برای کودکان تعریف نشده است');
        }
        calculatedDose = drug.child_dose_mg_kg * weightKg;
        break;

      case AgeGroup.ADULT:
        if (!drug.adult_dose_mg) {
          throw new BadRequestException('دوز برای بزرگسالان تعریف نشده است');
        }
        calculatedDose = drug.adult_dose_mg;
        break;

      default:
        throw new BadRequestException('گروه سنی نامعتبر');
    }

    return Math.round(calculatedDose * 100) / 100; // Round to 2 decimal places
  }

  private performSafetyChecks(
    calculatedDoseMg: number,
    drug: any,
    ageYears: number,
    weightKg: number
  ): { isSafe: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let isSafe = true;

    // Check maximum single dose
    if (drug.max_single_dose_mg && calculatedDoseMg > drug.max_single_dose_mg) {
      warnings.push(`دوز محاسبه شده (${calculatedDoseMg}mg) از حداکثر دوز مجاز (${drug.max_single_dose_mg}mg) بیشتر است`);
      isSafe = false;
    }

    // Check maximum daily dose
    const totalDailyDose = calculatedDoseMg * drug.max_doses_per_day;
    if (drug.max_daily_dose_mg && totalDailyDose > drug.max_daily_dose_mg) {
      warnings.push(`دوز روزانه (${totalDailyDose}mg) از حداکثر دوز روزانه مجاز (${drug.max_daily_dose_mg}mg) بیشتر است`);
      isSafe = false;
    }

    // Weight-based warnings
    if (weightKg < 3) {
      warnings.push('وزن بسیار کم - نیاز به نظارت پزشکی');
    }

    if (ageYears < 0.5) {
      warnings.push('سن بسیار کم - حتماً با پزشک مشورت کنید');
    }

    // Add drug-specific warnings
    if (drug.warnings) {
      try {
        const drugWarnings = JSON.parse(drug.warnings);
        warnings.push(...drugWarnings);
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    return { isSafe, warnings };
  }

  private generateCalculationNotes(
    ageGroup: AgeGroup,
    weightKg: number,
    calculatedDoseMg: number,
    drug: any
  ): string {
    const ageGroupText = {
      [AgeGroup.INFANT]: 'خردسال',
      [AgeGroup.CHILD]: 'کودک',
      [AgeGroup.ADULT]: 'بزرگسال',
    };

    let notes = `محاسبه برای ${ageGroupText[ageGroup]} با وزن ${weightKg}kg. `;

    if (ageGroup === AgeGroup.INFANT || ageGroup === AgeGroup.CHILD) {
      const doseMgKg = ageGroup === AgeGroup.INFANT ? drug.infant_dose_mg_kg : drug.child_dose_mg_kg;
      notes += `دوز: ${doseMgKg}mg/kg × ${weightKg}kg = ${calculatedDoseMg}mg. `;
    } else {
      notes += `دوز ثابت بزرگسال: ${calculatedDoseMg}mg. `;
    }

    notes += `تکرار: هر ${drug.dosing_interval_hours} ساعت، حداکثر ${drug.max_doses_per_day} بار در روز.`;

    return notes;
  }

  async getDrugsList() {
    return this.prisma.drug.findMany({
      select: {
        id: true,
        name_fa: true,
        name_en: true,
        generic_name: true,
        min_age_months: true,
        max_age_years: true,
      },
      orderBy: {
        name_fa: 'asc',
      },
    });
  }

  async getCalculationHistory(userId: string, limit = 10) {
    return this.prisma.doseCalculation.findMany({
      where: { user_id: userId },
      include: {
        drug: {
          select: {
            name_fa: true,
            name_en: true,
            generic_name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}