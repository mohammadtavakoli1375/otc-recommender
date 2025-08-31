import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { WebPushService } from '../notifications/web-push.service';
import { SmsService } from '../notifications/sms.service';

interface ReminderJobData {
  medicationId: string;
  adherenceId: string;
  userId: string;
}

@Processor('medication-reminders')
@Injectable()
export class MedicationReminderProcessor {
  private readonly logger = new Logger(MedicationReminderProcessor.name);

  constructor(
    private prisma: PrismaService,
    private webPushService: WebPushService,
    private smsService: SmsService,
  ) {}

  @Process('send-reminder')
  async handleSendReminder(job: Job<ReminderJobData>) {
    const { medicationId, adherenceId, userId } = job.data;

    try {
      // دریافت اطلاعات دارو و کاربر
      const medication = await this.prisma.medication.findUnique({
        where: { id: medicationId },
        include: {
          user: {
            include: {
              pushSubscriptions: {
                where: { is_active: true },
              },
            },
          },
        },
      });

      if (!medication) {
        this.logger.error(`Medication not found: ${medicationId}`);
        return;
      }

      // بررسی وضعیت adherence
      const adherence = await this.prisma.medicationAdherence.findUnique({
        where: { id: adherenceId },
      });

      if (!adherence || adherence.status !== 'due') {
        this.logger.log(`Adherence ${adherenceId} is not due anymore`);
        return;
      }

      // ساخت پیام یادآوری
      const message = this.createReminderMessage(medication);

      // ارسال Push Notification
      let pushSent = false;
      if (medication.user.pushSubscriptions.length > 0) {
        try {
          const result = await this.webPushService.sendNotification(
            userId,
            {
              title: '🕒 زمان مصرف دارو',
              body: message,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/badge-72x72.png',
              data: {
                medicationId,
                adherenceId,
                action: 'medication-reminder',
              },
              actions: [
                {
                  action: 'taken',
                  title: '✅ مصرف شد',
                },
                {
                  action: 'snooze',
                  title: '⏰ 15 دقیقه دیگر',
                },
              ],
            },
          );
          pushSent = result.success > 0;
          this.logger.log(`Push notification sent for medication ${medicationId}: ${result.success} successful, ${result.failed} failed`);
        } catch (error) {
          this.logger.error(`Failed to send push notification: ${error.message}`);
        }
      }

      // ارسال SMS در صورت فعال بودن
      let smsSent = false;
      const user = medication.user;
      const notificationPrefs = user.notification_preferences
        ? JSON.parse(user.notification_preferences)
        : {};

      if (
        user.phone &&
        user.phone_verified &&
        notificationPrefs.sms !== false
      ) {
        try {
          await this.smsService.sendSms({
            to: user.phone,
            message: `🕒 زمان مصرف دارو\n${message}\n\nبرای تایید مصرف به اپلیکیشن مراجعه کنید.`,
          });
          smsSent = true;
          this.logger.log(`SMS sent for medication ${medicationId}`);
        } catch (error) {
          this.logger.error(`Failed to send SMS: ${error.message}`);
        }
      }

      // به‌روزرسانی وضعیت adherence
      await this.prisma.medicationAdherence.update({
        where: { id: adherenceId },
        data: {
          status: 'sent',
          channel: pushSent && smsSent ? 'push,sms' : pushSent ? 'push' : smsSent ? 'sms' : null,
        },
      });

      // تنظیم timeout برای missed
      setTimeout(async () => {
        try {
          const currentAdherence = await this.prisma.medicationAdherence.findUnique({
            where: { id: adherenceId },
          });

          if (currentAdherence && currentAdherence.status === 'sent') {
            await this.prisma.medicationAdherence.update({
              where: { id: adherenceId },
              data: { status: 'missed' },
            });
            this.logger.log(`Marked adherence ${adherenceId} as missed`);
          }
        } catch (error) {
          this.logger.error(`Failed to mark as missed: ${error.message}`);
        }
      }, 2 * 60 * 60 * 1000); // 2 ساعت بعد

    } catch (error) {
      this.logger.error(`Failed to process reminder job: ${error.message}`);
      throw error;
    }
  }

  private createReminderMessage(medication: any): string {
    let message = `${medication.drugName}`;

    if (medication.strength) {
      message += ` — ${medication.strength}`;
    }

    if (medication.form) {
      message += ` (${medication.form})`;
    }

    if (medication.notes) {
      message += `\n\n💡 نکات: ${medication.notes}`;
    }

    return message;
  }

  @Process('cleanup-old-adherence')
  async handleCleanupOldAdherence(job: Job) {
    try {
      // حذف رکوردهای قدیمی‌تر از 30 روز
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.prisma.medicationAdherence.deleteMany({
        where: {
          dueAt: {
            lt: thirtyDaysAgo,
          },
          status: {
            in: ['taken', 'missed', 'skipped'],
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old adherence records`);
    } catch (error) {
      this.logger.error(`Failed to cleanup old adherence records: ${error.message}`);
    }
  }
}