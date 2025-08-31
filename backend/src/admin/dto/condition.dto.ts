import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateConditionDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  title_fa: string;

  @IsString()
  @IsNotEmpty()
  title_en: string;

  @IsOptional()
  @IsString()
  education_md?: string;
}

export class UpdateConditionDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  title_fa?: string;

  @IsOptional()
  @IsString()
  title_en?: string;

  @IsOptional()
  @IsString()
  education_md?: string;
}