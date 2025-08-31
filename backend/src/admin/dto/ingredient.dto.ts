import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  atc?: string;

  @IsOptional()
  @IsString()
  rxnorm?: string;

  @IsOptional()
  @IsBoolean()
  otc_bool?: boolean;
}

export class UpdateIngredientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  atc?: string;

  @IsOptional()
  @IsString()
  rxnorm?: string;

  @IsOptional()
  @IsBoolean()
  otc_bool?: boolean;
}