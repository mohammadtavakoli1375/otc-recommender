import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { MedicationsService } from './medications.service';
import { MedicationsController } from './medications.controller';
import { MedicationReminderProcessor } from './medication-reminder.processor';
import { MedicationSchedulerService } from './medication-scheduler.service';
import { MedicationSafetyService } from './medication-safety.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
    // BullModule.registerQueueAsync({
    //   name: 'medication-reminders',
    //   useFactory: () => ({
    //     defaultJobOptions: {
    //       removeOnComplete: 100,
    //       removeOnFail: 50,
    //       attempts: 3,
    //       backoff: {
    //         type: 'exponential',
    //         delay: 2000,
    //       },
    //     },
    //   }),
    // }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [MedicationsController],
  providers: [MedicationsService, /* MedicationReminderProcessor, */ MedicationSchedulerService, MedicationSafetyService],
  exports: [MedicationsService],
})
export class MedicationsModule {
  constructor() {
    // Schedule cleanup job to run daily
    setInterval(async () => {
      // This would be better handled by a cron job in production
      console.log('Running daily cleanup...');
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
}