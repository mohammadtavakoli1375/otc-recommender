import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminders.dto';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async createReminder(userId: string, createDto: CreateReminderDto) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل بیمار یافت نشد');
    }

    return this.prisma.reminder.create({
      data: {
        patient_profile_id: profile.id,
        medication_history_id: createDto.medicationHistoryId,
        title: createDto.title,
        description: createDto.description,
        medication_name: createDto.medicationName,
        dosage: createDto.dosage,
        start_date: new Date(createDto.startDate),
        end_date: createDto.endDate ? new Date(createDto.endDate) : null,
        frequency_type: createDto.frequencyType,
        frequency_value: createDto.frequencyValue,
        times_per_day: createDto.timesPerDay,
        specific_times: createDto.specificTimes ? JSON.stringify(createDto.specificTimes) : null,
        is_active: createDto.isActive ?? true,
        notification_enabled: createDto.notificationEnabled ?? true,
      },
    });
  }

  async getUserReminders(userId: string) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل بیمار یافت نشد');
    }

    return this.prisma.reminder.findMany({
      where: {
        patient_profile_id: profile.id,
        is_active: true,
      },
      include: {
        medicationHistory: {
          include: {
            drug: true,
          },
        },
      },
      orderBy: { start_date: 'asc' },
    });
  }

  async getActiveReminders(userId: string) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل بیمار یافت نشد');
    }

    const now = new Date();
    return this.prisma.reminder.findMany({
      where: {
        patient_profile_id: profile.id,
        is_active: true,
        start_date: { lte: now },
        OR: [
          { end_date: null },
          { end_date: { gte: now } },
        ],
      },
      include: {
        medicationHistory: {
          include: {
            drug: true,
          },
        },
      },
      orderBy: { start_date: 'asc' },
    });
  }

  async updateReminder(userId: string, reminderId: string, updateDto: UpdateReminderDto) {
    // Verify ownership
    const reminder = await this.prisma.reminder.findFirst({
      where: {
        id: reminderId,
        patientProfile: {
          user_id: userId,
        },
      },
    });

    if (!reminder) {
      throw new NotFoundException('یادآوری یافت نشد');
    }

    return this.prisma.reminder.update({
      where: { id: reminderId },
      data: {
        ...updateDto,
        start_date: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
        end_date: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
        specific_times: updateDto.specificTimes ? JSON.stringify(updateDto.specificTimes) : undefined,
      },
    });
  }

  async deleteReminder(userId: string, reminderId: string) {
    // Verify ownership
    const reminder = await this.prisma.reminder.findFirst({
      where: {
        id: reminderId,
        patientProfile: {
          user_id: userId,
        },
      },
    });

    if (!reminder) {
      throw new NotFoundException('یادآوری یافت نشد');
    }

    return this.prisma.reminder.delete({
      where: { id: reminderId },
    });
  }

  async toggleReminder(userId: string, reminderId: string) {
    // Verify ownership
    const reminder = await this.prisma.reminder.findFirst({
      where: {
        id: reminderId,
        patientProfile: {
          user_id: userId,
        },
      },
    });

    if (!reminder) {
      throw new NotFoundException('یادآوری یافت نشد');
    }

    return this.prisma.reminder.update({
      where: { id: reminderId },
      data: {
        is_active: !reminder.is_active,
      },
    });
  }

  async generateCalendarEvents(userId: string, reminderId: string, format: 'ical'): Promise<{ content: string; filename: string; contentType: string; }>;
  async generateCalendarEvents(userId: string, reminderId: string, format: 'google'): Promise<{ url: string; title: string; medication: string; }>;
  async generateCalendarEvents(userId: string, reminderId: string, format: 'ical' | 'google') {
    // Verify ownership
    const reminder = await this.prisma.reminder.findFirst({
      where: {
        id: reminderId,
        patientProfile: {
          user_id: userId,
        },
      },
    });

    if (!reminder) {
      throw new NotFoundException('یادآوری یافت نشد');
    }

    if (format === 'ical') {
      return this.generateICalFormat(reminder);
    } else {
      return this.generateGoogleCalendarUrl(reminder);
    }
  }

  private generateICalFormat(reminder: any) {
    const startDate = new Date(reminder.start_date);
    const endDate = reminder.end_date ? new Date(reminder.end_date) : null;
    
    // Parse specific times
    const times = reminder.specific_times ? JSON.parse(reminder.specific_times) : ['08:00'];
    
    let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//OTC Recommender//Medication Reminder//EN\n';
    
    times.forEach((time: string) => {
      const [hours, minutes] = time.split(':');
      const eventStart = new Date(startDate);
      eventStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const eventEnd = new Date(eventStart);
      eventEnd.setMinutes(eventEnd.getMinutes() + 15); // 15-minute duration
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      icalContent += 'BEGIN:VEVENT\n';
      icalContent += `DTSTART:${formatDate(eventStart)}\n`;
      icalContent += `DTEND:${formatDate(eventEnd)}\n`;
      icalContent += `SUMMARY:${reminder.title} - ${reminder.medication_name}\n`;
      icalContent += `DESCRIPTION:دوز: ${reminder.dosage}\n`;
      if (reminder.description) {
        icalContent += `DESCRIPTION:${reminder.description}\n`;
      }
      icalContent += `UID:${reminder.id}-${time}@otc-recommender.com\n`;
      icalContent += 'END:VEVENT\n';
    });
    
    icalContent += 'END:VCALENDAR';
    
    return {
      content: icalContent,
      filename: `medication-reminder-${reminder.id}.ics`,
      contentType: 'text/calendar',
    };
  }

  private generateGoogleCalendarUrl(reminder: any) {
    const startDate = new Date(reminder.start_date);
    const times = reminder.specific_times ? JSON.parse(reminder.specific_times) : ['08:00'];
    
    const [hours, minutes] = times[0].split(':');
    const eventStart = new Date(startDate);
    eventStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const eventEnd = new Date(eventStart);
    eventEnd.setMinutes(eventEnd.getMinutes() + 15);
    
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const title = encodeURIComponent(`${reminder.title} - ${reminder.medication_name}`);
    const details = encodeURIComponent(`دوز: ${reminder.dosage}${reminder.description ? '\n' + reminder.description : ''}`);
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(eventStart)}/${formatGoogleDate(eventEnd)}&details=${details}&recur=RRULE:FREQ=DAILY`;
    
    return {
      url: googleUrl,
      title: reminder.title,
      medication: reminder.medication_name,
    };
  }
}