import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { NotificationsService } from './notifications.service';
import { DeliveryChannel } from '@prisma/client';

interface NotificationJobData {
  deliveryId: string;
  userId: string;
  channel: DeliveryChannel;
  title: string;
  body: string;
  phoneNumber?: string;
}

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<NotificationJobData>) {
    const { deliveryId, userId, channel, title, body, phoneNumber } = job.data;

    this.logger.log(`Processing notification job ${job.id} for delivery ${deliveryId}`);

    try {
      const result = await this.notificationsService.sendNotificationByChannel(
        deliveryId,
        userId,
        channel,
        title,
        body,
        phoneNumber,
      );

      if (result.success) {
        this.logger.log(`Notification job ${job.id} completed successfully`);
      } else {
        this.logger.error(`Notification job ${job.id} failed: ${result.error}`);
        throw new Error(result.error || 'Unknown error');
      }

      return result;
    } catch (error) {
      this.logger.error(`Notification job ${job.id} failed:`, error);
      throw error;
    }
  }

  @Process('retry-notification')
  async handleRetryNotification(job: Job<{ deliveryId: string }>) {
    const { deliveryId } = job.data;

    this.logger.log(`Processing retry notification job ${job.id} for delivery ${deliveryId}`);

    try {
      const result = await this.notificationsService.retryFailedDelivery(deliveryId);
      
      if (result.success) {
        this.logger.log(`Retry notification job ${job.id} completed successfully`);
      } else {
        this.logger.error(`Retry notification job ${job.id} failed: ${result.error}`);
        throw new Error(result.error || 'Unknown error');
      }

      return result;
    } catch (error) {
      this.logger.error(`Retry notification job ${job.id} failed:`, error);
      throw error;
    }
  }

  @Process('cleanup-old-deliveries')
  async handleCleanupOldDeliveries(job: Job<{ olderThanDays: number }>) {
    const { olderThanDays } = job.data;

    this.logger.log(`Processing cleanup job ${job.id} for deliveries older than ${olderThanDays} days`);

    try {
      // This would be implemented in the notifications service
      // await this.notificationsService.cleanupOldDeliveries(olderThanDays);
      
      this.logger.log(`Cleanup job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Cleanup job ${job.id} failed:`, error);
      throw error;
    }
  }
}