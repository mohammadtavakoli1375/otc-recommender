import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TriageModule } from './triage/triage.module';
import { AdminModule } from './admin/admin.module';
import { DoseCalculatorModule } from './dose-calculator/dose-calculator.module';
import { AuthModule } from './auth/auth.module';
import { PatientProfileModule } from './patient-profile/patient-profile.module';
import { RemindersModule } from './reminders/reminders.module';
import { EducationalContentModule } from './educational-content/educational-content.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MedicationsModule } from './medications/medications.module';
import { MapsModule } from './maps/maps.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
        },
      }),
      inject: [ConfigService],
    }),
    TriageModule,
    AdminModule,
    DoseCalculatorModule,
    AuthModule,
    PatientProfileModule,
    RemindersModule,
    EducationalContentModule,
    NotificationsModule,
    MedicationsModule,
    MapsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
