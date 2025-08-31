import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { WebPushService, PushNotificationPayload } from './web-push.service';
import { SmsService } from './sms.service';
import { DeliveryChannel, DeliveryStatus } from '@prisma/client';

export interface NotificationPreferences {
  push: boolean;
  sms: boolean;
  email: boolean;
}

export interface ScheduleNotificationDto {
  userId: string;
  reminderId: string;
  title: string;
  body: string;
  scheduledAt: Date;
  channels?: DeliveryChannel[];
}

export interface SendNotificationDto {
  userId: string;
  title: string;
  body: string;
  channels: DeliveryChannel[];
  reminderId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webPushService: WebPushService,
    private readonly smsService: SmsService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  async scheduleNotification(dto: ScheduleNotificationDto) {
    try {
      // Get user preferences
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
        select: {
          id: true,
          phone: true,
          phone_verified: true,
          notification_preferences: true,
        },
      });

      if (!user) {
        throw new Error(`User ${dto.userId} not found`);
      }

      const preferences = this.parseNotificationPreferences(user.notification_preferences);
      const enabledChannels = dto.channels || this.getEnabledChannels(user, preferences);

      // Create delivery records for each enabled channel
      const deliveries: any[] = [];
      
      for (const channel of enabledChannels) {
        // Skip SMS if phone not verified
        if (channel === DeliveryChannel.SMS && (!user.phone || !user.phone_verified)) {
          this.logger.warn(`Skipping SMS for user ${dto.userId}: phone not verified`);
          continue;
        }

        const delivery = await this.prisma.reminderDelivery.create({
          data: {
            reminder_id: dto.reminderId,
            user_id: dto.userId,
            channel,
            status: DeliveryStatus.SCHEDULED,
            scheduled_at: dto.scheduledAt,
            title: dto.title,
            body: dto.body,
            phone_number: channel === DeliveryChannel.SMS ? user.phone : null,
          },
        });

        deliveries.push(delivery);

        // Add job to queue
        await this.notificationQueue.add(
          'send-notification',
          {
            deliveryId: delivery.id,
            userId: dto.userId,
            channel,
            title: dto.title,
            body: dto.body,
            phoneNumber: user.phone,
          },
          {
            delay: dto.scheduledAt.getTime() - Date.now(),
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        );
      }

      this.logger.log(`Scheduled ${deliveries.length} notifications for reminder ${dto.reminderId}`);
      return deliveries;
    } catch (error) {
      this.logger.error(`Failed to schedule notification:`, error);
      throw error;
    }
  }

  async sendImmediateNotification(dto: SendNotificationDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
        select: {
          id: true,
          phone: true,
          phone_verified: true,
        },
      });

      if (!user) {
        throw new Error(`User ${dto.userId} not found`);
      }

      const results: Array<{ channel: any; success: boolean; error?: string }> = [];

      for (const channel of dto.channels) {
        // Skip SMS if phone not verified
        if (channel === DeliveryChannel.SMS && (!user.phone || !user.phone_verified)) {
          this.logger.warn(`Skipping SMS for user ${dto.userId}: phone not verified`);
          continue;
        }

        // Create delivery record
        const delivery = await this.prisma.reminderDelivery.create({
          data: {
            reminder_id: dto.reminderId || 'immediate',
            user_id: dto.userId,
            channel,
            status: DeliveryStatus.SCHEDULED,
            scheduled_at: new Date(),
            title: dto.title,
            body: dto.body,
            phone_number: channel === DeliveryChannel.SMS ? user.phone : null,
          },
        });

        // Send immediately
        const result = await this.sendNotificationByChannel(
          delivery.id,
          dto.userId,
          channel,
          dto.title,
          dto.body,
          user.phone || undefined,
        );

        results.push({ channel, ...result });
      }

      return results;
    } catch (error) {
      this.logger.error(`Failed to send immediate notification:`, error);
      throw error;
    }
  }

  async sendNotificationByChannel(
    deliveryId: string,
    userId: string,
    channel: DeliveryChannel,
    title: string,
    body: string,
    phoneNumber?: string,
  ) {
    try {
      let success = false;
      let error: string | null = null;

      switch (channel) {
        case DeliveryChannel.PUSH:
          const pushPayload: PushNotificationPayload = {
            title,
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data: {
              type: 'reminder',
              deliveryId,
              timestamp: new Date().toISOString(),
            },
          };
          
          const pushResult = await this.webPushService.sendNotification(userId, pushPayload);
          success = pushResult.success > 0;
          error = pushResult.errors.length > 0 ? pushResult.errors.join(', ') : null;
          break;

        case DeliveryChannel.SMS:
          if (!phoneNumber) {
            success = false;
            error = 'Phone number not available';
          } else {
            const smsResult = await this.smsService.sendSms({
              to: phoneNumber,
              message: `${title}\n${body}`,
            });
            success = smsResult.success;
            error = smsResult.error || null;
          }
          break;

        case DeliveryChannel.EMAIL:
          // TODO: Implement email service
          success = false;
          error = 'Email service not implemented';
          break;

        default:
          success = false;
          error = `Unsupported channel: ${channel}`;
      }

      // Update delivery record
      await this.prisma.reminderDelivery.update({
        where: { id: deliveryId },
        data: {
          status: success ? DeliveryStatus.SENT : DeliveryStatus.FAILED,
          sent_at: success ? new Date() : null,
          failed_at: success ? null : new Date(),
          error_message: error,
        },
      });

      this.logger.log(`Notification ${success ? 'sent' : 'failed'} via ${channel} to user ${userId}`);
      
      return { success, error };
    } catch (error) {
      this.logger.error(`Failed to send ${channel} notification:`, error);
      
      // Update delivery record with error
      await this.prisma.reminderDelivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.FAILED,
          failed_at: new Date(),
          error_message: error.message,
        },
      });

      return { success: false, error: error.message };
    }
  }

  async updateUserNotificationPreferences(userId: string, preferences: NotificationPreferences) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          notification_preferences: JSON.stringify(preferences),
        },
      });

      this.logger.log(`Updated notification preferences for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to update notification preferences for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notification_preferences: true },
    });

    return this.parseNotificationPreferences(user?.notification_preferences || null);
  }

  async getDeliveryHistory(userId: string, limit = 50) {
    return await this.prisma.reminderDelivery.findMany({
      where: { user_id: userId },
      include: {
        reminder: {
          select: {
            title: true,
            medication_name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async retryFailedDelivery(deliveryId: string) {
    try {
      const delivery = await this.prisma.reminderDelivery.findUnique({
        where: { id: deliveryId },
        include: { user: true },
      });

      if (!delivery) {
        throw new Error(`Delivery ${deliveryId} not found`);
      }

      if (delivery.retry_count >= delivery.max_retries) {
        throw new Error(`Maximum retry attempts reached for delivery ${deliveryId}`);
      }

      // Update retry count
      await this.prisma.reminderDelivery.update({
        where: { id: deliveryId },
        data: {
          status: DeliveryStatus.RETRY,
          retry_count: delivery.retry_count + 1,
        },
      });

      // Retry sending
      return await this.sendNotificationByChannel(
        delivery.id,
        delivery.user_id,
        delivery.channel,
        delivery.title,
        delivery.body,
        delivery.phone_number || undefined,
      );
    } catch (error) {
      this.logger.error(`Failed to retry delivery ${deliveryId}:`, error);
      throw error;
    }
  }

  private parseNotificationPreferences(preferencesJson?: string | null): NotificationPreferences {
    const defaultPreferences: NotificationPreferences = {
      push: true,
      sms: true,
      email: false,
    };

    if (!preferencesJson) {
      return defaultPreferences;
    }

    try {
      const parsed = JSON.parse(preferencesJson);
      return {
        push: parsed.push ?? defaultPreferences.push,
        sms: parsed.sms ?? defaultPreferences.sms,
        email: parsed.email ?? defaultPreferences.email,
      };
    } catch (error) {
      this.logger.warn(`Failed to parse notification preferences: ${preferencesJson}`);
      return defaultPreferences;
    }
  }

  private getEnabledChannels(user: any, preferences: NotificationPreferences): DeliveryChannel[] {
    const channels: DeliveryChannel[] = [];

    if (preferences.push) {
      channels.push(DeliveryChannel.PUSH);
    }

    if (preferences.sms && user.phone && user.phone_verified) {
      channels.push(DeliveryChannel.SMS);
    }

    if (preferences.email) {
      channels.push(DeliveryChannel.EMAIL);
    }

    return channels;
  }
}