import { IsString, IsIn, IsOptional, IsInt, Min } from 'class-validator';

export class MarkMedicationDto {
  @IsString()
  @IsIn(['taken', 'snooze', 'skip'])
  action: 'taken' | 'snooze' | 'skip';

  @IsOptional()
  @IsInt()
  @Min(5)
  snoozeMinutes?: number; // برای snooze - پیش‌فرض 15 دقیقه

  @IsOptional()
  @IsString()
  notes?: string; // یادداشت اختیاری
}