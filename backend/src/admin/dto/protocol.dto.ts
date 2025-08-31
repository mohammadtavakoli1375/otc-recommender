import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateProtocolDto {
  @IsString()
  @IsNotEmpty()
  condition_id: string;

  @IsObject()
  @IsNotEmpty()
  rules_jsonb: any;

  @IsString()
  @IsNotEmpty()
  created_by: string;
}

export class UpdateProtocolDto {
  @IsOptional()
  @IsObject()
  rules_jsonb?: any;
}