import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalculateDoseDto {
  @ApiProperty({ description: 'Drug ID' })
  @IsString()
  drugId: string;

  @ApiProperty({ description: 'Patient age in years', minimum: 0, maximum: 120 })
  @IsNumber()
  @Min(0)
  @Max(120)
  ageYears: number;

  @ApiProperty({ description: 'Patient age in months', minimum: 0, maximum: 1440 })
  @IsNumber()
  @Min(0)
  @Max(1440)
  ageMonths: number;

  @ApiProperty({ description: 'Patient weight in kg', minimum: 0.5, maximum: 300 })
  @IsNumber()
  @Min(0.5)
  @Max(300)
  weightKg: number;

  @ApiProperty({ description: 'User ID for saving calculation history', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DoseCalculationResultDto {
  @ApiProperty({ description: 'Calculated dose in mg' })
  calculatedDoseMg: number;

  @ApiProperty({ description: 'Calculated dose in ml (if liquid)', required: false })
  calculatedDoseMl?: number;

  @ApiProperty({ description: 'Number of doses per day' })
  dosesPerDay: number;

  @ApiProperty({ description: 'Total daily dose in mg' })
  totalDailyDoseMg: number;

  @ApiProperty({ description: 'Age group classification' })
  ageGroup: 'INFANT' | 'CHILD' | 'ADULT';

  @ApiProperty({ description: 'Safety status' })
  isSafe: boolean;

  @ApiProperty({ description: 'Safety warnings', type: [String] })
  safetyWarnings: string[];

  @ApiProperty({ description: 'Calculation notes' })
  calculationNotes: string;

  @ApiProperty({ description: 'Drug information' })
  drug: {
    id: string;
    nameFa: string;
    nameEn: string;
    genericName: string;
  };
}