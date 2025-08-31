import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, Min, IsBoolean, IsArray } from 'class-validator';
import { FrequencyType } from '@prisma/client';

export class CreateReminderDto {
  @IsOptional()
  @IsString({ message: 'شناسه سابقه دارویی باید رشته باشد' })
  medicationHistoryId?: string;

  @IsString({ message: 'عنوان باید رشته باشد' })
  title: string;

  @IsOptional()
  @IsString({ message: 'توضیحات باید رشته باشد' })
  description?: string;

  @IsString({ message: 'نام دارو باید رشته باشد' })
  medicationName: string;

  @IsString({ message: 'دوز باید رشته باشد' })
  dosage: string;

  @IsDateString({}, { message: 'تاریخ شروع معتبر وارد کنید' })
  startDate: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاریخ پایان معتبر وارد کنید' })
  endDate?: string;

  @IsEnum(FrequencyType, { message: 'نوع فرکانس معتبر انتخاب کنید' })
  frequencyType: FrequencyType;

  @IsNumber({}, { message: 'مقدار فرکانس باید عدد باشد' })
  @Min(1, { message: 'مقدار فرکانس باید حداقل 1 باشد' })
  frequencyValue: number;

  @IsOptional()
  @IsNumber({}, { message: 'تعداد دفعات در روز باید عدد باشد' })
  @Min(1, { message: 'تعداد دفعات در روز باید حداقل 1 باشد' })
  timesPerDay?: number;

  @IsOptional()
  @IsArray({ message: 'زمان‌های مشخص باید آرایه باشد' })
  @IsString({ each: true, message: 'هر زمان باید رشته باشد' })
  specificTimes?: string[];

  @IsOptional()
  @IsBoolean({ message: 'وضعیت فعال بودن باید بولین باشد' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'وضعیت اعلان باید بولین باشد' })
  notificationEnabled?: boolean;
}

export class UpdateReminderDto {
  @IsOptional()
  @IsString({ message: 'عنوان باید رشته باشد' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'توضیحات باید رشته باشد' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'نام دارو باید رشته باشد' })
  medication_name?: string;

  @IsOptional()
  @IsString({ message: 'دوز باید رشته باشد' })
  dosage?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاریخ شروع معتبر وارد کنید' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاریخ پایان معتبر وارد کنید' })
  endDate?: string;

  @IsOptional()
  @IsEnum(FrequencyType, { message: 'نوع فرکانس معتبر انتخاب کنید' })
  frequency_type?: FrequencyType;

  @IsOptional()
  @IsNumber({}, { message: 'مقدار فرکانس باید عدد باشد' })
  @Min(1, { message: 'مقدار فرکانس باید حداقل 1 باشد' })
  frequency_value?: number;

  @IsOptional()
  @IsNumber({}, { message: 'تعداد دفعات در روز باید عدد باشد' })
  @Min(1, { message: 'تعداد دفعات در روز باید حداقل 1 باشد' })
  times_per_day?: number;

  @IsOptional()
  @IsArray({ message: 'زمان‌های مشخص باید آرایه باشد' })
  @IsString({ each: true, message: 'هر زمان باید رشته باشد' })
  specificTimes?: string[];

  @IsOptional()
  @IsBoolean({ message: 'وضعیت فعال بودن باید بولین باشد' })
  is_active?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'وضعیت اعلان باید بولین باشد' })
  notification_enabled?: boolean;
}