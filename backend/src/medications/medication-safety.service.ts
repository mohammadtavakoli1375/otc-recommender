import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SafetyWarning {
  type: 'MAX_DOSE' | 'INTERACTION' | 'CONTRAINDICATION' | 'AGE_RESTRICTION' | 'FREQUENCY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  recommendation?: string;
}

@Injectable()
export class MedicationSafetyService {
  private readonly logger = new Logger(MedicationSafetyService.name);

  constructor(private prisma: PrismaService) {}

  async validateMedicationSafety(
    drugName: string,
    userId: string,
    maxPerDay: number,
    intervalHrs?: number,
  ): Promise<SafetyWarning[]> {
    const warnings: SafetyWarning[] = [];

    try {
      // بررسی دارو در دیتابیس
      const drug = await this.findDrugByName(drugName);
      
      if (drug) {
        // بررسی حداکثر دوز روزانه
        warnings.push(...this.checkMaxDailyDose(drug, maxPerDay));
        
        // بررسی فاصله زمانی
        if (intervalHrs) {
          warnings.push(...this.checkDosingInterval(drug, intervalHrs));
        }
        
        // بررسی تداخلات دارویی
        const interactions = await this.checkDrugInteractions(userId, drug);
        warnings.push(...interactions);
        
        // بررسی موانع مصرف
        const contraindications = await this.checkContraindications(userId, drug);
        warnings.push(...contraindications);
      } else {
        // دارو در دیتابیس موجود نیست - هشدار عمومی
        warnings.push({
          type: 'CONTRAINDICATION',
          severity: 'MEDIUM',
          message: `دارو "${drugName}" در دیتابیس ما موجود نیست.`,
          recommendation: 'لطفاً قبل از مصرف با پزشک یا داروساز مشورت کنید.',
        });
      }
      
      // بررسی تعداد داروهای همزمان
      const concurrentMedsWarning = await this.checkConcurrentMedications(userId);
      if (concurrentMedsWarning) {
        warnings.push(concurrentMedsWarning);
      }
      
    } catch (error) {
      this.logger.error(`Error validating medication safety: ${error.message}`);
      warnings.push({
        type: 'CONTRAINDICATION',
        severity: 'MEDIUM',
        message: 'خطا در بررسی ایمنی دارو.',
        recommendation: 'لطفاً با پزشک مشورت کنید.',
      });
    }

    return warnings;
  }

  private async findDrugByName(drugName: string) {
    // جستجو در دیتابیس داروها
    const drug = await this.prisma.drug.findFirst({
      where: {
        OR: [
          { name_fa: { contains: drugName } },
          { name_en: { contains: drugName } },
          { generic_name: { contains: drugName } },
        ],
      },
    });

    return drug;
  }

  private checkMaxDailyDose(drug: any, maxPerDay: number): SafetyWarning[] {
    const warnings: SafetyWarning[] = [];

    if (drug.max_doses_per_day && maxPerDay > drug.max_doses_per_day) {
      warnings.push({
        type: 'MAX_DOSE',
        severity: 'HIGH',
        message: `تعداد دفعات مصرف روزانه (${maxPerDay}) بیش از حد مجاز (${drug.max_doses_per_day}) است.`,
        recommendation: `حداکثر ${drug.max_doses_per_day} بار در روز مصرف کنید.`,
      });
    }

    return warnings;
  }

  private checkDosingInterval(drug: any, intervalHrs: number): SafetyWarning[] {
    const warnings: SafetyWarning[] = [];

    if (drug.dosing_interval_hours && intervalHrs < drug.dosing_interval_hours) {
      warnings.push({
        type: 'FREQUENCY',
        severity: 'HIGH',
        message: `فاصله زمانی مصرف (${intervalHrs} ساعت) کمتر از حد مجاز (${drug.dosing_interval_hours} ساعت) است.`,
        recommendation: `حداقل ${drug.dosing_interval_hours} ساعت فاصله بین دوزها رعایت کنید.`,
      });
    }

    return warnings;
  }

  private async checkDrugInteractions(userId: string, drug: any): Promise<SafetyWarning[]> {
    const warnings: SafetyWarning[] = [];

    try {
      // دریافت داروهای فعلی کاربر
      const currentMedications = await this.prisma.medication.findMany({
        where: {
          userId,
          startAt: { lte: new Date() },
          OR: [
            { endAt: null },
            { endAt: { gte: new Date() } },
          ],
        },
      });

      if (drug.drug_interactions) {
        const interactions = JSON.parse(drug.drug_interactions);
        
        for (const currentMed of currentMedications) {
          const hasInteraction = interactions.some((interaction: string) => 
            currentMed.drugName.toLowerCase().includes(interaction.toLowerCase()) ||
            interaction.toLowerCase().includes(currentMed.drugName.toLowerCase())
          );
          
          if (hasInteraction) {
            warnings.push({
              type: 'INTERACTION',
              severity: 'HIGH',
              message: `احتمال تداخل دارویی با "${currentMed.drugName}" وجود دارد.`,
              recommendation: 'لطفاً با پزشک یا داروساز مشورت کنید.',
            });
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error checking drug interactions: ${error.message}`);
    }

    return warnings;
  }

  private async checkContraindications(userId: string, drug: any): Promise<SafetyWarning[]> {
    const warnings: SafetyWarning[] = [];

    try {
      // دریافت پروفایل بیمار
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { user_id: userId },
        include: { medicalHistory: true },
      });

      if (patientProfile && drug.contraindications) {
        const contraindications = JSON.parse(drug.contraindications);
        
        // بررسی سن
        const age = this.calculateAge(patientProfile.date_of_birth);
        if (drug.min_age_months && age * 12 < drug.min_age_months) {
          warnings.push({
            type: 'AGE_RESTRICTION',
            severity: 'CRITICAL',
            message: `این دارو برای سن شما (${age} سال) مناسب نیست.`,
            recommendation: `حداقل سن مجاز: ${Math.floor(drug.min_age_months / 12)} سال.`,
          });
        }
        
        if (drug.max_age_years && age > drug.max_age_years) {
          warnings.push({
            type: 'AGE_RESTRICTION',
            severity: 'HIGH',
            message: `احتیاط در مصرف این دارو در سن شما (${age} سال) لازم است.`,
            recommendation: 'با پزشک مشورت کنید.',
          });
        }
        
        // بررسی سابقه پزشکی
        for (const medicalHistory of patientProfile.medicalHistory) {
          if (medicalHistory.is_active) {
            const hasContraindication = contraindications.some((contra: string) => 
              medicalHistory.condition_name.toLowerCase().includes(contra.toLowerCase()) ||
              contra.toLowerCase().includes(medicalHistory.condition_name.toLowerCase())
            );
            
            if (hasContraindication) {
              warnings.push({
                type: 'CONTRAINDICATION',
                severity: 'CRITICAL',
                message: `به دلیل سابقه "${medicalHistory.condition_name}" مصرف این دارو ممنوع است.`,
                recommendation: 'حتماً با پزشک مشورت کنید.',
              });
            }
          }
        }
        
        // بررسی آلرژی‌ها
        if (patientProfile.allergies) {
          const allergies = JSON.parse(patientProfile.allergies);
          const hasAllergy = allergies.some((allergy: string) => 
            drug.generic_name.toLowerCase().includes(allergy.toLowerCase()) ||
            drug.name_fa.toLowerCase().includes(allergy.toLowerCase())
          );
          
          if (hasAllergy) {
            warnings.push({
              type: 'CONTRAINDICATION',
              severity: 'CRITICAL',
              message: 'احتمال آلرژی به این دارو وجود دارد.',
              recommendation: 'مصرف این دارو ممنوع است.',
            });
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error checking contraindications: ${error.message}`);
    }

    return warnings;
  }

  private async checkConcurrentMedications(userId: string): Promise<SafetyWarning | null> {
    try {
      const activeMedicationsCount = await this.prisma.medication.count({
        where: {
          userId,
          startAt: { lte: new Date() },
          OR: [
            { endAt: null },
            { endAt: { gte: new Date() } },
          ],
        },
      });

      if (activeMedicationsCount >= 5) {
        return {
          type: 'INTERACTION',
          severity: 'MEDIUM',
          message: `شما در حال حاضر ${activeMedicationsCount} دارو مصرف می‌کنید.`,
          recommendation: 'مصرف همزمان داروهای متعدد ممکن است خطرناک باشد. با پزشک مشورت کنید.',
        };
      }
    } catch (error) {
      this.logger.error(`Error checking concurrent medications: ${error.message}`);
    }

    return null;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // متد عمومی برای دریافت هشدارهای ایمنی برای نمایش در UI
  formatWarningsForUI(warnings: SafetyWarning[]): any[] {
    return warnings.map(warning => ({
      type: warning.type,
      severity: warning.severity,
      message: warning.message,
      recommendation: warning.recommendation,
      icon: this.getWarningIcon(warning.severity),
      color: this.getWarningColor(warning.severity),
    }));
  }

  private getWarningIcon(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '⚡';
      case 'LOW': return 'ℹ️';
      default: return '⚠️';
    }
  }

  private getWarningColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'blue';
      default: return 'gray';
    }
  }
}