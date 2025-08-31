import { IsNotEmpty, IsNumber, IsString, IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PatientDto {
  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsString()
  @IsNotEmpty()
  sex: 'M' | 'F';

  @IsOptional()
  @IsNumber()
  pregnantWeeks?: number;

  @IsBoolean()
  isElder: boolean;

  @IsArray()
  @IsString({ each: true })
  meds: string[];
}

export class TriageDto {
  @ValidateNested()
  @Type(() => PatientDto)
  patient: PatientDto;

  @IsArray()
  @IsString({ each: true })
  symptoms: string[];

  @IsNumber()
  durationDays: number;

  @IsNotEmpty()
  redFlags: Record<string, boolean>;
}