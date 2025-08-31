import { IsString, IsOptional, IsDateString, IsArray, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedicationDto {
  @IsString()
  drugName: string;

  @IsOptional()
  @IsString()
  form?: string; // قرص/شربت/کرم

  @IsOptional()
  @IsString()
  strength?: string; // 500mg, 5mg/5ml

  @IsOptional()
  @IsString()
  notes?: string; // با غذا، آب زیاد

  @IsDateString()
  startAt: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  // Schedule information
  @IsString()
  rule: 'DAILY' | 'WEEKLY' | 'INTERVAL'; // DAILY|WEEKLY|INTERVAL

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  times?: string[]; // ["08:00","14:00","20:00"]

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  intervalHrs?: number; // اگر هر N ساعت

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxPerDay?: number; // سقف دفعات

  @IsOptional()
  quietHours?: {
    start: string; // "22:00"
    end: string;   // "07:00"
  };
}