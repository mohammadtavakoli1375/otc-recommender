import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateSymptomDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name_fa: string;

  @IsString()
  @IsNotEmpty()
  name_en: string;

  @IsOptional()
  @IsString()
  tags?: string; // JSON string
}

export class UpdateSymptomDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name_fa?: string;

  @IsOptional()
  @IsString()
  name_en?: string;

  @IsOptional()
  @IsString()
  tags?: string; // JSON string
}