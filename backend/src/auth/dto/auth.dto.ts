import { IsEmail, IsString, MinLength, IsDateString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Gender } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'ایمیل معتبر وارد کنید' })
  email: string;

  @IsString({ message: 'رمز عبور باید رشته باشد' })
  @MinLength(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
  password: string;

  @IsString({ message: 'نام باید رشته باشد' })
  firstName: string;

  @IsString({ message: 'نام خانوادگی باید رشته باشد' })
  lastName: string;

  @IsDateString({}, { message: 'تاریخ تولد معتبر وارد کنید' })
  dateOfBirth: string;

  @IsEnum(Gender, { message: 'جنسیت معتبر انتخاب کنید' })
  gender: Gender;

  @IsNumber({}, { message: 'وزن باید عدد باشد' })
  @Min(1, { message: 'وزن باید حداقل 1 کیلوگرم باشد' })
  @Max(300, { message: 'وزن باید حداکثر 300 کیلوگرم باشد' })
  weightKg: number;
}

export class LoginDto {
  @IsEmail({}, { message: 'ایمیل معتبر وارد کنید' })
  email: string;

  @IsString({ message: 'رمز عبور باید رشته باشد' })
  password: string;
}