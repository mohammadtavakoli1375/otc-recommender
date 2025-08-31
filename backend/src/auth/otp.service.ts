import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../notifications/sms.service';
import * as crypto from 'crypto';

export interface OtpData {
  id: string;
  phoneNumber: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

export interface SendOtpResult {
  success: boolean;
  otpId?: string;
  message: string;
  expiresIn?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  verified: boolean;
  message: string;
  remainingAttempts?: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpStorage = new Map<string, OtpData>();
  private readonly maxAttempts = 3;
  private readonly otpLength = 5;
  private readonly otpExpiryMinutes = 5;
  private readonly resendCooldownMinutes = 2;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {
    // Clean up expired OTPs every 5 minutes
    setInterval(() => this.cleanupExpiredOtps(), 5 * 60 * 1000);
  }

  async sendOtp(userId: string, phoneNumber: string): Promise<SendOtpResult> {
    try {
      // Clean phone number
      const cleanPhone = this.cleanPhoneNumber(phoneNumber);
      
      if (!this.isValidIranianPhoneNumber(cleanPhone)) {
        return {
          success: false,
          message: 'شماره موبایل نامعتبر است',
        };
      }

      // Check for recent OTP requests (rate limiting)
      const recentOtp = this.findRecentOtp(cleanPhone);
      if (recentOtp && !this.canResendOtp(recentOtp)) {
        const remainingTime = Math.ceil((recentOtp.expiresAt.getTime() - Date.now()) / 1000 / 60);
        return {
          success: false,
          message: `لطفاً ${remainingTime} دقیقه صبر کنید`,
        };
      }

      // Generate OTP
      const otpCode = this.generateOtpCode();
      const otpId = this.generateOtpId();
      const expiresAt = new Date(Date.now() + this.otpExpiryMinutes * 60 * 1000);

      // Store OTP
      const otpData: OtpData = {
        id: otpId,
        phoneNumber: cleanPhone,
        code: otpCode,
        expiresAt,
        attempts: 0,
        verified: false,
      };
      
      this.otpStorage.set(otpId, otpData);

      // Send SMS
      const smsResult = await this.smsService.sendOtp(cleanPhone, otpCode);
      
      if (!smsResult.success) {
        // Remove OTP if SMS failed
        this.otpStorage.delete(otpId);
        return {
          success: false,
          message: smsResult.error || 'خطا در ارسال پیامک',
        };
      }

      this.logger.log(`OTP sent to ${cleanPhone} for user ${userId}`);
      
      return {
        success: true,
        otpId,
        message: 'کد تأیید ارسال شد',
        expiresIn: this.otpExpiryMinutes * 60,
      };
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${phoneNumber}:`, error);
      return {
        success: false,
        message: 'خطا در ارسال کد تأیید',
      };
    }
  }

  async verifyOtp(
    userId: string,
    otpId: string,
    otpCode: string,
    phoneNumber: string,
  ): Promise<VerifyOtpResult> {
    try {
      const otpData = this.otpStorage.get(otpId);
      
      if (!otpData) {
        return {
          success: false,
          verified: false,
          message: 'کد تأیید نامعتبر یا منقضی شده است',
        };
      }

      // Check if OTP is expired
      if (otpData.expiresAt < new Date()) {
        this.otpStorage.delete(otpId);
        return {
          success: false,
          verified: false,
          message: 'کد تأیید منقضی شده است',
        };
      }

      // Check if already verified
      if (otpData.verified) {
        return {
          success: false,
          verified: false,
          message: 'این کد قبلاً استفاده شده است',
        };
      }

      // Increment attempts
      otpData.attempts++;

      // Check max attempts
      if (otpData.attempts > this.maxAttempts) {
        this.otpStorage.delete(otpId);
        return {
          success: false,
          verified: false,
          message: 'تعداد تلاش‌های مجاز تمام شده است',
        };
      }

      // Verify phone number matches
      const cleanPhone = this.cleanPhoneNumber(phoneNumber);
      if (otpData.phoneNumber !== cleanPhone) {
        return {
          success: false,
          verified: false,
          message: 'شماره موبایل مطابقت ندارد',
          remainingAttempts: this.maxAttempts - otpData.attempts,
        };
      }

      // Verify OTP code
      if (otpData.code !== otpCode) {
        return {
          success: false,
          verified: false,
          message: 'کد تأیید اشتباه است',
          remainingAttempts: this.maxAttempts - otpData.attempts,
        };
      }

      // Mark as verified
      otpData.verified = true;

      // Update user phone number and verification status
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          phone: cleanPhone,
          phone_verified: true,
        },
      });

      // Clean up OTP
      this.otpStorage.delete(otpId);

      this.logger.log(`Phone ${cleanPhone} verified successfully for user ${userId}`);
      
      return {
        success: true,
        verified: true,
        message: 'شماره موبایل با موفقیت تأیید شد',
      };
    } catch (error) {
      this.logger.error(`Failed to verify OTP for user ${userId}:`, error);
      return {
        success: false,
        verified: false,
        message: 'خطا در تأیید کد',
      };
    }
  }

  async resendOtp(userId: string, otpId: string): Promise<SendOtpResult> {
    try {
      const otpData = this.otpStorage.get(otpId);
      
      if (!otpData) {
        return {
          success: false,
          message: 'درخواست نامعتبر',
        };
      }

      if (!this.canResendOtp(otpData)) {
        const remainingTime = Math.ceil(
          (otpData.expiresAt.getTime() - Date.now() + this.resendCooldownMinutes * 60 * 1000) / 1000 / 60
        );
        return {
          success: false,
          message: `لطفاً ${remainingTime} دقیقه صبر کنید`,
        };
      }

      // Remove old OTP and send new one
      this.otpStorage.delete(otpId);
      return await this.sendOtp(userId, otpData.phoneNumber);
    } catch (error) {
      this.logger.error(`Failed to resend OTP:`, error);
      return {
        success: false,
        message: 'خطا در ارسال مجدد کد',
      };
    }
  }

  private generateOtpCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  private generateOtpId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle Iranian phone number formats
    if (cleaned.startsWith('0098')) {
      cleaned = cleaned.substring(4);
    } else if (cleaned.startsWith('98')) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Add Iran country code if not present
    if (!cleaned.startsWith('98')) {
      cleaned = '98' + cleaned;
    }
    
    return cleaned;
  }

  private isValidIranianPhoneNumber(phone: string): boolean {
    // Iranian mobile number pattern: 98 + 9 + 9 digits
    const iranMobilePattern = /^989[0-9]{9}$/;
    return iranMobilePattern.test(phone);
  }

  private findRecentOtp(phoneNumber: string): OtpData | null {
    for (const otpData of this.otpStorage.values()) {
      if (otpData.phoneNumber === phoneNumber && otpData.expiresAt > new Date()) {
        return otpData;
      }
    }
    return null;
  }

  private canResendOtp(otpData: OtpData): boolean {
    const cooldownEnd = new Date(otpData.expiresAt.getTime() - this.resendCooldownMinutes * 60 * 1000);
    return new Date() > cooldownEnd;
  }

  private cleanupExpiredOtps(): void {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [otpId, otpData] of this.otpStorage.entries()) {
      if (otpData.expiresAt < now) {
        this.otpStorage.delete(otpId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} expired OTPs`);
    }
  }

  // Admin/Debug methods
  getOtpStats(): { total: number; expired: number; verified: number } {
    const now = new Date();
    let expired = 0;
    let verified = 0;
    
    for (const otpData of this.otpStorage.values()) {
      if (otpData.expiresAt < now) expired++;
      if (otpData.verified) verified++;
    }
    
    return {
      total: this.otpStorage.size,
      expired,
      verified,
    };
  }
}