import { Module } from '@nestjs/common';
import { PatientProfileService } from './patient-profile.service';
import { PatientProfileController } from './patient-profile.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PatientProfileController],
  providers: [PatientProfileService],
  exports: [PatientProfileService],
})
export class PatientProfileModule {}