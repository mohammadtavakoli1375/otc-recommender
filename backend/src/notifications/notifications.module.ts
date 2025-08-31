import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { WebPushService } from './web-push.service';
import { SmsService } from './sms.service';
import { NotificationProcessor } from './notification.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    // BullModule.registerQueue({
    //   name: 'notifications',
    // }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    WebPushService,
    SmsService,
    NotificationProcessor,
  ],
  exports: [
    NotificationsService,
    WebPushService,
    SmsService,
  ],
})
export class NotificationsModule {}