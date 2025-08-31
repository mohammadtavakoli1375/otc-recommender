import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { MarkMedicationDto } from './dto/mark-medication.dto';
import { MedicationSafetyService } from './medication-safety.service';
// import type { Queue } from 'bull';
// import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class MedicationsService {
  constructor(
    private prisma: PrismaService,
    private safetyService: MedicationSafetyService,
    // @InjectQueue('medication-reminders') private medicationQueue?: Queue,
  ) {}

  async create(userId: string, createMedicationDto: CreateMedicationDto) {
    const { rule, times, intervalHrs, maxPerDay, quietHours, ...medicationData } = createMedicationDto;

    // بررسی هشدارهای ایمنی
    const safetyWarnings = await this.safetyService.validateMedicationSafety(
      createMedicationDto.drugName,
      userId,
      maxPerDay || 3,
      intervalHrs,
    );

    // ایجاد دارو
    const medication = await this.prisma.medication.create({
      data: {
        ...medicationData,
        userId,
        startAt: new Date(createMedicationDto.startAt),
        endAt: createMedicationDto.endAt ? new Date(createMedicationDto.endAt) : null,
      },
    });

    // ایجاد برنامه زمان‌بندی
    const schedule = await this.prisma.medicationSchedule.create({
      data: {
        medicationId: medication.id,
        rule,
        times: times || undefined,
        intervalHrs,
        maxPerDay,
        quietHours: quietHours || undefined,
      },
    });

    // ایجاد job‌های یادآوری برای 48 ساعت آینده
    // if (this.medicationQueue) {
    //   await this.scheduleReminders(medication.id);
    // }

    return {
      ...medication,
      schedule,
      safetyWarnings: this.safetyService.formatWarningsForUI(safetyWarnings),
    };
  }

  async findAll(userId: string) {
    return this.prisma.medication.findMany({
      where: { userId },
      include: {
        schedules: true,
        adherence: {
          where: {
            dueAt: {
              gte: new Date(),
            },
          },
          orderBy: { dueAt: 'asc' },
          take: 1, // فقط نزدیک‌ترین دوز
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const medication = await this.prisma.medication.findFirst({
      where: { id, userId },
      include: {
        schedules: true,
        adherence: {
          orderBy: { dueAt: 'desc' },
          take: 10, // آخرین 10 دوز
        },
      },
    });

    if (!medication) {
      throw new NotFoundException('دارو یافت نشد');
    }

    return medication;
  }

  async update(id: string, userId: string, updateMedicationDto: UpdateMedicationDto) {
    const medication = await this.prisma.medication.findFirst({
      where: { id, userId },
    });

    if (!medication) {
      throw new NotFoundException('دارو یافت نشد');
    }

    const { rule, times, intervalHrs, maxPerDay, quietHours, ...medicationData } = updateMedicationDto;

    // به‌روزرسانی دارو
    const updatedMedication = await this.prisma.medication.update({
      where: { id },
      data: {
        ...medicationData,
        startAt: updateMedicationDto.startAt ? new Date(updateMedicationDto.startAt) : undefined,
        endAt: updateMedicationDto.endAt ? new Date(updateMedicationDto.endAt) : undefined,
      },
    });

    // به‌روزرسانی برنامه در صورت وجود
    if (rule || times || intervalHrs !== undefined || maxPerDay !== undefined || quietHours !== undefined) {
      await this.prisma.medicationSchedule.updateMany({
        where: { medicationId: id },
        data: {
          ...(rule && { rule }),
          ...(times && { times: JSON.stringify(times) }),
          ...(intervalHrs !== undefined && { intervalHrs }),
          ...(maxPerDay !== undefined && { maxPerDay }),
          ...(quietHours && { quietHours: JSON.stringify(quietHours) }),
        },
      });

      // بازنویسی job‌های یادآوری
      await this.rescheduleReminders(id);
    }

    return updatedMedication;
  }

  async remove(id: string, userId: string) {
    const medication = await this.prisma.medication.findFirst({
      where: { id, userId },
    });

    if (!medication) {
      throw new NotFoundException('دارو یافت نشد');
    }

    // حذف job‌های مربوطه
    await this.cancelReminders(id);

    // حذف دارو (cascade delete برای schedules و adherence)
    await this.prisma.medication.delete({
      where: { id },
    });

    return { message: 'دارو با موفقیت حذف شد' };
  }

  async markAdherence(adherenceId: string, userId: string, markDto: MarkMedicationDto) {
    // پیدا کردن adherence record
    const adherence = await this.prisma.medicationAdherence.findFirst({
      where: {
        id: adherenceId,
        medication: { userId },
      },
      include: { medication: true },
    });

    if (!adherence) {
      throw new NotFoundException('رکورد یادآوری یافت نشد');
    }

    if (adherence.status === 'taken') {
      throw new BadRequestException('این دوز قبلاً مصرف شده است');
    }

    let updateData: any = {};

    switch (markDto.action) {
      case 'taken':
        updateData = {
          status: 'taken',
          takenAt: new Date(),
        };
        break;

      case 'skip':
        updateData = {
          status: 'skipped',
        };
        break;

      case 'snooze':
        const snoozeMinutes = markDto.snoozeMinutes || 15;
        const newDueAt = new Date(adherence.dueAt.getTime() + snoozeMinutes * 60000);
        
        updateData = {
          status: 'snoozed',
          dueAt: newDueAt,
        };

        // ایجاد job جدید برای snooze
        // if (this.medicationQueue) {
        //   await this.medicationQueue.add(
        //     'send-reminder',
        //     {
        //       medicationId: adherence.medicationId,
        //       adherenceId: adherence.id,
        //       userId,
        //     },
        //     {
        //       delay: snoozeMinutes * 60000,
        //       jobId: `reminder-${adherence.id}-snooze`,
        //     },
        //   );
        // }
        break;
    }

    return this.prisma.medicationAdherence.update({
      where: { id: adherenceId },
      data: updateData,
    });
  }

  async getDailyStats(userId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const stats = await this.prisma.medicationAdherence.groupBy({
      by: ['status'],
      where: {
        medication: { userId },
        dueAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _count: {
        status: true,
      },
    });

    const result = {
      due: 0,
      sent: 0,
      taken: 0,
      missed: 0,
      snoozed: 0,
      skipped: 0,
    };

    stats.forEach((stat) => {
      result[stat.status] = stat._count.status;
    });

    return result;
  }

  private async scheduleReminders(medicationId: string) {
    const medication = await this.prisma.medication.findUnique({
      where: { id: medicationId },
      include: { schedules: true },
    });

    if (!medication || !medication.schedules.length) return;

    const schedule = medication.schedules[0];
    const now = new Date();
    const endTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 ساعت آینده

    const reminderTimes = this.calculateReminderTimes(
      medication.startAt,
      endTime,
      schedule,
      medication.timezone,
    );

    for (const reminderTime of reminderTimes) {
      // ایجاد adherence record
      const adherence = await this.prisma.medicationAdherence.create({
        data: {
          medicationId,
          dueAt: reminderTime,
          status: 'due',
        },
      });

      // ایجاد job برای ارسال یادآوری
      // if (this.medicationQueue) {
      //   await this.medicationQueue.add(
      //     'send-reminder',
      //     {
      //       medicationId,
      //       adherenceId: adherence.id,
      //       userId: medication.userId,
      //     },
      //     {
      //       delay: Math.max(0, reminderTime.getTime() - now.getTime()),
      //       jobId: `reminder-${adherence.id}`,
      //     },
      //   );
      // }
    }
  }

  private async rescheduleReminders(medicationId: string) {
    // حذف job‌های قدیمی
    await this.cancelReminders(medicationId);

    // حذف adherence records آینده
    await this.prisma.medicationAdherence.deleteMany({
      where: {
        medicationId,
        status: 'due',
        dueAt: { gt: new Date() },
      },
    });

    // ایجاد job‌های جدید
    await this.scheduleReminders(medicationId);
  }

  private async cancelReminders(medicationId: string) {
    const adherenceRecords = await this.prisma.medicationAdherence.findMany({
      where: {
        medicationId,
        status: 'due',
        dueAt: { gt: new Date() },
      },
    });

    // if (this.medicationQueue) {
    //   for (const adherence of adherenceRecords) {
    //     try {
    //       await this.medicationQueue.removeJobs(`reminder-${adherence.id}`);
    //     } catch (error) {
    //       // Job ممکن است وجود نداشته باشد
    //     }
    //   }
    // }
  }

  private calculateReminderTimes(
    startAt: Date,
    endAt: Date,
    schedule: any,
    timezone: string,
  ): Date[] {
    const times: Date[] = [];
    const current = new Date(Math.max(startAt.getTime(), new Date().getTime()));

    while (current <= endAt) {
      if (schedule.rule === 'DAILY' && schedule.times) {
        for (const timeStr of schedule.times) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const reminderTime = new Date(current);
          reminderTime.setHours(hours, minutes, 0, 0);

          if (reminderTime > new Date() && reminderTime <= endAt) {
            // بررسی quiet hours
            if (!this.isInQuietHours(reminderTime, schedule.quietHours)) {
              times.push(new Date(reminderTime));
            }
          }
        }
        current.setDate(current.getDate() + 1);
      } else if (schedule.rule === 'INTERVAL' && schedule.intervalHrs) {
        const reminderTime = new Date(current);
        if (reminderTime > new Date() && reminderTime <= endAt) {
          if (!this.isInQuietHours(reminderTime, schedule.quietHours)) {
            times.push(new Date(reminderTime));
          }
        }
        current.setTime(current.getTime() + schedule.intervalHrs * 60 * 60 * 1000);
      } else {
        break;
      }
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
}