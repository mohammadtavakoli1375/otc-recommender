// import { Processor, Process } from '@nestjs/bull';
// import { Logger } from '@nestjs/common';
// import type { Job } from 'bull';
// import { NotificationsService } from './notifications.service';
// import { DeliveryChannel } from '@prisma/client';

// interface NotificationJobData {
//   deliveryId: string;
//   userId: string;
//   channel: DeliveryChannel;
//   title: string;
//   body: string;
//   phoneNumber?: string;
// }

// @Processor('notifications')
// export class NotificationProcessor {
//   private readonly logger = new Logger(NotificationProcessor.name);

//   constructor(private readonly notificationsService: NotificationsService) {}

//   @Process('send-notification')
//   async handleSendNotification(job: Job<NotificationJobData>) {
//     const { deliveryId, userId, channel, title, body, phoneNumber } = job.data;

//     this.logger.log(`Processing notification job ${job.id} for delivery ${deliveryId}`);

//     try {
//       const result = await this.notificationsService.sendNotificationByChannel(
//         deliveryId,
//         userId,
//         channel,
//         title,
//         body,
//         phoneNumber,
//       );

//       if (result.success) {
//         this.logger.log(`Successfully sent notification for delivery ${deliveryId}`);
//       } else {
//         this.logger.error(`Failed to send notification for delivery ${deliveryId}: ${result.error}`);
//         throw new Error(result.error);
//       }
//     } catch (error) {
//       this.logger.error(`Error processing notification job ${job.id}:`, error);
//       throw error;
//     }
//   }

//   @Process('retry-notification')
//   async handleRetryNotification(job: Job<{ deliveryId: string }>) {
//     const { deliveryId } = job.data;

//     this.logger.log(`Retrying notification for delivery ${deliveryId}`);

//     try {
//       await this.notificationsService.retryFailedDelivery(deliveryId);
//       this.logger.log(`Successfully retried notification for delivery ${deliveryId}`);
//     } catch (error) {
//       this.logger.error(`Error retrying notification for delivery ${deliveryId}:`, error);
//       throw error;
//     }
//   }

//   @Process('cleanup-old-deliveries')
//   async handleCleanupOldDeliveries(job: Job<{ olderThanDays: number }>) {
//     const { olderThanDays } = job.data;

//     this.logger.log(`Cleaning up deliveries older than ${olderThanDays} days`);

//     try {
//       // Implementation for cleanup would go here
//       this.logger.log(`Successfully cleaned up old deliveries`);
//     } catch (error) {
//       this.logger.error(`Error cleaning up old deliveries:`, error);
//       throw error;
//     }
//   }
// }

// Temporary empty export to avoid module errors
export class NotificationProcessor {}