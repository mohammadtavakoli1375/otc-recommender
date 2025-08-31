import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicationSchedulerService {
  private readonly logger = new Logger(MedicationSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    // @InjectQueue('medication-reminders') private medicationQueue?: Queue,
  ) {}

  // هر ساعت اجرا شود - Rolling Window برای 48 ساعت آینده
  @Cron(CronExpression.EVERY_HOUR)
  async scheduleUpcomingReminders() {
    this.logger.log('Starting rolling window scheduling...');

    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() + 47 * 60 * 60 * 1000); // 47 ساعت بعد
      const windowEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000);   // 48 ساعت بعد

      // پیدا کردن داروهای فعال
      const activeMedications = await this.prisma.medication.findMany({
        where: {
          startAt: { lte: windowEnd },
          OR: [
            { endAt: null },
            { endAt: { gte: windowStart } },
          ],
        },
        include: {
          schedules: true,
          user: true,
        },
      });

      let scheduledCount = 0;

      for (const medication of activeMedications) {
        if (!medication.schedules.length) continue;

        const schedule = medication.schedules[0];
        const reminderTimes = this.calculateReminderTimesInWindow(
          windowStart,
          windowEnd,
          schedule,
          medication.timezone,
        );

        for (const reminderTime of reminderTimes) {
          // بررسی اینکه آیا قبلاً adherence record وجود دارد
          const existingAdherence = await this.prisma.medicationAdherence.findFirst({
            where: {
              medicationId: medication.id,
              dueAt: {
                gte: new Date(reminderTime.getTime() - 5 * 60 * 1000), // 5 دقیقه قبل
                lte: new Date(reminderTime.getTime() + 5 * 60 * 1000), // 5 دقیقه بعد
              },
            },
          });

          if (existingAdherence) continue;

          // ایجاد adherence record
          const adherence = await this.prisma.medicationAdherence.create({
            data: {
              medicationId: medication.id,
              dueAt: reminderTime,
              status: 'due',
            },
          });

          // ایجاد job برای ارسال یادآوری
          // if (this.medicationQueue) {
          //   const delay = Math.max(0, reminderTime.getTime() - now.getTime());
          //   await this.medicationQueue.add(
          //     'send-reminder',
          //     {
          //       medicationId: medication.id,
          //       adherenceId: adherence.id,
          //       userId: medication.userId,
          //     },
          //     {
          //       delay,
          //       jobId: `reminder-${adherence.id}`,
          //     },
          //   );
          // }

          scheduledCount++;
        }
      }

      this.logger.log(`Scheduled ${scheduledCount} new reminders`);
    } catch (error) {
      this.logger.error(`Failed to schedule reminders: ${error.message}`);
    }
  }

  // هر روز در ساعت 2 صبح - پاکسازی رکوردهای قدیمی
  @Cron('0 2 * * *')
  async cleanupOldRecords() {
    this.logger.log('Starting daily cleanup...');

    try {
      // حذف adherence records قدیمی‌تر از 30 روز
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const adherenceResult = await this.prisma.medicationAdherence.deleteMany({
        where: {
          dueAt: { lt: thirtyDaysAgo },
          status: { in: ['taken', 'missed', 'skipped'] },
        },
      });

      // حذف job‌های completed/failed قدیمی
      // if (this.medicationQueue) {
      //   await this.medicationQueue.clean(24 * 60 * 60 * 1000, 'completed');
      //   await this.medicationQueue.clean(24 * 60 * 60 * 1000, 'failed');
      // }

      this.logger.log(
        `Cleanup completed: ${adherenceResult.count} adherence records removed`,
      );
    } catch (error) {
      this.logger.error(`Failed to cleanup old records: ${error.message}`);
    }
  }

  // هر 6 ساعت - بررسی missed doses
  @Cron('0 */6 * * *')
  async checkMissedDoses() {
    this.logger.log('Checking for missed doses...');

    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const missedDoses = await this.prisma.medicationAdherence.updateMany({
        where: {
          status: 'sent',
          dueAt: { lt: twoHoursAgo },
        },
        data: {
          status: 'missed',
        },
      });

      if (missedDoses.count > 0) {
        this.logger.log(`Marked ${missedDoses.count} doses as missed`);
      }
    } catch (error) {
      this.logger.error(`Failed to check missed doses: ${error.message}`);
    }
  }

  private calculateReminderTimesInWindow(
    windowStart: Date,
    windowEnd: Date,
    schedule: any,
    timezone: string,
  ): Date[] {
    const times: Date[] = [];
    const current = new Date(windowStart);

    while (current <= windowEnd) {
      if (schedule.rule === 'DAILY' && schedule.times) {
        for (const timeStr of schedule.times) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const reminderTime = new Date(current);
          reminderTime.setHours(hours, minutes, 0, 0);

          if (reminderTime >= windowStart && reminderTime <= windowEnd) {
            // بررسی quiet hours
            if (!this.isInQuietHours(reminderTime, schedule.quietHours)) {
              times.push(new Date(reminderTime));
            } else {
              // شیفت به نزدیک‌ترین زمان مجاز
              const adjustedTime = this.adjustForQuietHours(reminderTime, schedule.quietHours);
              if (adjustedTime >= windowStart && adjustedTime <= windowEnd) {
                times.push(adjustedTime);
              }
            }
          }
        }
        current.setDate(current.getDate() + 1);
        current.setHours(0, 0, 0, 0);
      } else if (schedule.rule === 'INTERVAL' && schedule.intervalHrs) {
        const reminderTime = new Date(current);
        if (reminderTime >= windowStart && reminderTime <= windowEnd) {
          if (!this.isInQuietHours(reminderTime, schedule.quietHours)) {
            times.push(new Date(reminderTime));
          } else {
            const adjustedTime = this.adjustForQuietHours(reminderTime, schedule.quietHours);
            if (adjustedTime >= windowStart && adjustedTime <= windowEnd) {
              times.push(adjustedTime);
            }
          }
        }
        current.setTime(current.getTime() + schedule.intervalHrs * 60 * 60 * 1000);
      } else {
        break;
      }

      // جلوگیری از infinite loop
      if (times.length > 100) break;
    }

    return times;
  }

  private isInQuietHours(time: Date, quietHours: any): boolean {
    if (!quietHours || !quietHours.start || !quietHours.end) return false;

    const timeStr = time.toTimeString().substring(0, 5); // HH:MM
    const start = quietHours.start;
    const end = quietHours.end;

    if (start <= end) {
      return timeStr >= start && timeStr <= end;
    } else {
      // Quiet hours cross midnight
      return timeStr >= start || timeStr <= end;
    }
  }

  private adjustForQuietHours(time: Date, quietHours: any): Date {
    if (!quietHours || !quietHours.end) return time;

    const adjustedTime = new Date(time);
    const [endHours, endMinutes] = quietHours.end.split(':').map(Number);
    
    adjustedTime.setHours(endHours, endMinutes, 0, 0);
    
    // اگر زمان تنظیم شده قبل از زمان اصلی است، یک روز اضافه کن
    if (adjustedTime <= time) {
      adjustedTime.setDate(adjustedTime.getDate() + 1);
    }

    return adjustedTime;
  }
}