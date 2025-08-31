import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePatientProfileDto, CreateMedicalHistoryDto, CreateMedicationHistoryDto } from './dto/patient-profile.dto';

@Injectable()
export class PatientProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { user_id: userId },
      include: {
        medicalHistory: {
          where: { is_active: true },
          orderBy: { createdAt: 'desc' },
        },
        medicationHistory: {
          where: { is_current: true },
          include: {
            drug: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        reminders: {
          where: { is_active: true },
          orderBy: { start_date: 'asc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل بیمار یافت نشد');
    }

    return profile;
  }

  async updateProfile(userId: string, updateDto: UpdatePatientProfileDto) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل بیمار یافت نشد');
    }

    return this.prisma.patientProfile.update({
      where: { user_id: userId },
      data: {
        ...updateDto,
        date_of_birth: updateDto.dateOfBirth ? new Date(updateDto.dateOfBirth) : undefined,
      },
    });
  }

  async addMedicalHistory(userId: string, createDto: CreateMedicalHistoryDto) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل بیمار یافت نشد');
    }

    return this.prisma.medicalHistory.create({
      data: {
        patient_profile_id: profile.id,
        condition_name: createDto.conditionName,
        condition_type: createDto.conditionType,
        diagnosed_date: createDto.diagnosedDate ? new Date(createDto.diagnosedDate) : null,
        is_chronic: createDto.isChronic,
        is_active: createDto.isActive,
        notes: createDto.notes,
      },
    });
  }

  async updateMedicalHistory(userId: string, historyId: string, updateDto: Partial<CreateMedicalHistoryDto>) {
    // Verify ownership
    const history = await this.prisma.medicalHistory.findFirst({
      where: {
        id: historyId,
        patientProfile: {
          user_id: userId,
        },
      },
    });

    if (!history) {
      throw new NotFoundException('سابقه پزشکی یافت نشد');
    }

    return this.prisma.medicalHistory.update({
      where: { id: historyId },
      data: {
        ...updateDto,
        diagnosed_date: updateDto.diagnosedDate ? new Date(updateDto.diagnosedDate) : undefined,
      },
    });
  }

  async deleteMedicalHistory(userId: string, historyId: string) {
    // Verify ownership
    const history = await this.prisma.medicalHistory.findFirst({
      where: {
        id: historyId,
        patientProfile: {
          user_id: userId,
        },
      },
    });

    if (!history) {
      throw new NotFoundException('سابقه پزشکی یافت نشد');
    }

    return this.prisma.medicalHistory.delete({
      where: { id: historyId },
    });
  }

  async addMedicationHistory(userId: string, createDto: CreateMedicationHistoryDto) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('پروفایل بیمار یافت نشد');
    }

    return this.prisma.medicationHistory.create({
      data: {
        patient_profile_id: profile.id,
        drug_id: createDto.drugId,
        medication_name: createDto.medicationName,
        dosage: createDto.dosage,
        frequency: createDto.frequency,
        start_date: new Date(createDto.startDate),
        end_date: createDto.endDate ? new Date(createDto.endDate) : null,
        is_current: createDto.isCurrent,
        prescribed_by: createDto.prescribedBy,
        notes: createDto.notes,
      },
    });
  }

  async updateMedicationHistory(userId: string, historyId: string, updateDto: Partial<CreateMedicationHistoryDto>) {
    // Verify ownership
    const history = await this.prisma.medicationHistory.findFirst({
      where: {
        id: historyId,
        patientProfile: {
          user_id: userId,
        },
      },
    });

    if (!history) {
      throw new NotFoundException('سابقه دارویی یافت نشد');
    }

    return this.prisma.medicationHistory.update({
      where: { id: historyId },
      data: {
        ...updateDto,
        start_date: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
        end_date: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
      },
    });
  }

  async deleteMedicationHistory(userId: string, historyId: string) {
    // Verify ownership
    const history = await this.prisma.medicationHistory.findFirst({
      where: {
        id: historyId,
        patientProfile: {
          user_id: userId,
        },
      },
    });

    if (!history) {
      throw new NotFoundException('سابقه دارویی یافت نشد');
    }

    return this.prisma.medicationHistory.delete({
      where: { id: historyId },
    });
  }

  async getDoseCalculationHistory(userId: string, limit = 10) {
    return this.prisma.doseCalculation.findMany({
      where: { user_id: userId },
      include: {
        drug: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}