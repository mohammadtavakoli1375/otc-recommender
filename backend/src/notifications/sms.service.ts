import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface SmsMessage {
  to: string;
  message: string;
  sender?: string;
}

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode?: number;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly sender: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SMS_API_KEY') || '';
    this.sender = this.configService.get<string>('SMS_SENDER', '10008663');
    this.baseUrl = this.configService.get<string>('SMS_BASE_URL', 'https://api.kavenegar.com/v1');

    if (!this.apiKey) {
      this.logger.warn('SMS API key not configured. SMS notifications will not work.');
    } else {
      this.logger.log('SMS service initialized with Kavenegar API');
    }
  }

  async sendSms(smsData: SmsMessage): Promise<SmsResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'SMS API key not configured',
      };
    }

    try {
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = this.cleanPhoneNumber(smsData.to);
      
      if (!this.isValidIranianPhoneNumber(cleanPhone)) {
        return {
          success: false,
          error: 'Invalid Iranian phone number format',
        };
      }

      const url = `${this.baseUrl}/${this.apiKey}/sms/send.json`;
      
      const payload = {
        receptor: cleanPhone,
        message: smsData.message,
        sender: smsData.sender || this.sender,
      };

      this.logger.log(`Sending SMS to ${cleanPhone}`);
      
      const response = await axios.post(url, payload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data && response.data.return && response.data.return.status === 200) {
        const messageId = response.data.entries?.[0]?.messageid;
        this.logger.log(`SMS sent successfully to ${cleanPhone}, MessageID: ${messageId}`);
        
        return {
          success: true,
          messageId: messageId?.toString(),
        };
      } else {
        const errorMessage = response.data?.return?.message || 'Unknown SMS API error';
        this.logger.error(`SMS API error: ${errorMessage}`);
        
        return {
          success: false,
          error: errorMessage,
          statusCode: response.data?.return?.status,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${smsData.to}:`, error);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.return?.message || error.message,
          statusCode: error.response?.status,
        };
      }
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  async sendBulkSms(messages: SmsMessage[]): Promise<SmsResponse[]> {
    const results: SmsResponse[] = [];
    
    // Send messages in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchPromises = batch.map(message => this.sendSms(message));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < messages.length) {
        await this.delay(1000); // 1 second delay
      }
    }
    
    return results;
  }

  async sendOtp(phoneNumber: string, code: string): Promise<SmsResponse> {
    const message = `کد تأیید شما در سیستم OTC Recommender: ${code}\nاین کد تا 5 دقیقه معتبر است.`;
    
    return await this.sendSms({
      to: phoneNumber,
      message,
    });
  }

  async sendReminderSms(phoneNumber: string, reminderTitle: string, medicationName: string, dosage: string): Promise<SmsResponse> {
    const message = `یادآوری دارو\n${reminderTitle}\nدارو: ${medicationName}\nدوز: ${dosage}\nOTC Recommender`;
    
    return await this.sendSms({
      to: phoneNumber,
      message,
    });
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getDeliveryStatus(messageId: string): Promise<any> {
    if (!this.apiKey || !messageId) {
      return null;
    }

    try {
      const url = `${this.baseUrl}/${this.apiKey}/sms/status.json`;
      
      const response = await axios.post(url, {
        messageid: messageId,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get SMS delivery status for message ${messageId}:`, error);
      return null;
    }
  }
}