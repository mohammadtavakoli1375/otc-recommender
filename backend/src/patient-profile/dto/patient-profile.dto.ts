import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Gender, MedicalConditionType } from '@prisma/client';

export class UpdatePatientProfileDto {
  @IsOptional()
  @IsString({ message: 'نام باید رشته باشد' })
  first_name?: string;

  @IsOptional()
  @IsString({ message: 'نام خانوادگی باید رشته باشد' })
  last_name?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاریخ تولد معتبر وارد کنید' })
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'جنسیت معتبر انتخاب کنید' })
  gender?: Gender;

  @IsOptional()
  @IsNumber({}, { message: 'وزن باید عدد باشد' })
  @Min(1, { message: 'وزن باید حداقل 1 کیلوگرم باشد' })
  @Max(300, { message: 'وزن باید حداکثر 300 کیلوگرم باشد' })
  weight_kg?: number;

  @IsOptional()
  @IsNumber({}, { message: 'قد باید عدد باشد' })
  @Min(30, { message: 'قد باید حداقل 30 سانتی‌متر باشد' })
  @Max(250, { message: 'قد باید حداکثر 250 سانتی‌متر باشد' })
  height_cm?: number;

  @IsOptional()
  @IsString({ message: 'شماره تلفن باید رشته باشد' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'مخاطب اضطراری باید رشته باشد' })
  emergency_contact?: string;

  @IsOptional()
  @IsString({ message: 'گروه خونی باید رشته باشد' })
  blood_type?: string;

  @IsOptional()
  @IsString({ message: 'آلرژی‌ها باید رشته باشد' })
  allergies?: string;
}

export class CreateMedicalHistoryDto {
  @IsString({ message: 'نام بیماری باید رشته باشد' })
  conditionName: string;

  @IsEnum(MedicalConditionType, { message: 'نوع بیماری معتبر انتخاب کنید' })
  conditionType: MedicalConditionType;

  @IsOptional()
  @IsDateString({}, { message: 'تاریخ تشخیص معتبر وارد کنید' })
  diagnosedDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'وضعیت مزمن بودن باید بولین باشد' })
  isChronic?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'وضعیت فعال بودن باید بولین باشد' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'یادداشت باید رشته باشد' })
  notes?: string;
}

export class CreateMedicationHistoryDto {
  @IsOptional()
  @IsString({ message: 'شناسه دارو باید رشته باشد' })
  drugId?: string;

  @IsString({ message: 'نام دارو باید رشته باشد' })
  medicationName: string;

  @IsString({ message: 'دوز باید رشته باشد' })
  dosage: string;

  @IsString({ message: 'فرکانس مصرف باید رشته باشد' })
  frequency: string;

  @IsDateString({}, { message: 'تاریخ شروع معتبر وارد کنید' })
  startDate: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاریخ پایان معتبر وارد کنید' })
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'وضعیت فعلی باید بولین باشد' })
  isCurrent?: boolean;

  @IsOptional()
  @IsString({ message: 'تجویزکننده باید رشته باشد' })
  prescribedBy?: string;

  @IsOptional()
  @IsString({ message: 'یادداشت باید رشته باشد' })
  notes?: string;
}