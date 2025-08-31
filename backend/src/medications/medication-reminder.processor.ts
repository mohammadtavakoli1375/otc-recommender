// import { Processor, Process } from '@nestjs/bull';
// import { Logger } from '@nestjs/common';
// import type { Job } from 'bull';
// import { NotificationsService } from '../notifications/notifications.service';

// interface MedicationReminderJobData {
//   medicationId: string;
//   userId: string;
//   adherenceId: string;
//   medicationName: string;
//   dosage: string;
//   scheduledAt: Date;
// }

// @Processor('medication-reminders')
// export class MedicationReminderProcessor {
//   private readonly logger = new Logger(MedicationReminderProcessor.name);

//   constructor(private readonly notificationsService: NotificationsService) {}

//   @Process('send-reminder')
//   async handleSendReminder(job: Job<MedicationReminderJobData>) {
//     const { medicationId, userId, adherenceId, medicationName, dosage, scheduledAt } = job.data;

//     this.logger.log(`Processing medication reminder job ${job.id} for medication ${medicationId}`);

//     try {
//       await this.notificationsService.sendImmediateNotification({
//         userId,
//         title: '💊 یادآوری دارو',
//         body: `زمان مصرف ${medicationName} (${dosage}) فرا رسیده است`,
//         channels: ['PUSH', 'SMS'],
//         reminderId: adherenceId,
//       });

//       this.logger.log(`Successfully sent medication reminder for ${medicationName}`);
//     } catch (error) {
//       this.logger.error(`Error sending medication reminder:`, error);
//       throw error;
//     }
//   }
// }

// Temporary empty export to avoid module errors
export class MedicationReminderProcessor {}