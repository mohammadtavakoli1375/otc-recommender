import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PatientProfileService } from './patient-profile.service';
import { UpdatePatientProfileDto, CreateMedicalHistoryDto, CreateMedicationHistoryDto } from './dto/patient-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('patient-profile')
@UseGuards(JwtAuthGuard)
export class PatientProfileController {
  constructor(private patientProfileService: PatientProfileService) {}

  @Get()
  async getProfile(@Request() req) {
    return this.patientProfileService.getProfile(req.user.id);
  }

  @Put()
  async updateProfile(@Request() req, @Body() updateDto: UpdatePatientProfileDto) {
    return this.patientProfileService.updateProfile(req.user.id, updateDto);
  }

  @Post('medical-history')
  async addMedicalHistory(@Request() req, @Body() createDto: CreateMedicalHistoryDto) {
    return this.patientProfileService.addMedicalHistory(req.user.id, createDto);
  }

  @Put('medical-history/:id')
  async updateMedicalHistory(
    @Request() req,
    @Param('id') historyId: string,
    @Body() updateDto: Partial<CreateMedicalHistoryDto>
  ) {
    return this.patientProfileService.updateMedicalHistory(req.user.id, historyId, updateDto);
  }

  @Delete('medical-history/:id')
  async deleteMedicalHistory(@Request() req, @Param('id') historyId: string) {
    return this.patientProfileService.deleteMedicalHistory(req.user.id, historyId);
  }

  @Post('medication-history')
  async addMedicationHistory(@Request() req, @Body() createDto: CreateMedicationHistoryDto) {
    return this.patientProfileService.addMedicationHistory(req.user.id, createDto);
  }

  @Put('medication-history/:id')
  async updateMedicationHistory(
    @Request() req,
    @Param('id') historyId: string,
    @Body() updateDto: Partial<CreateMedicationHistoryDto>
  ) {
    return this.patientProfileService.updateMedicationHistory(req.user.id, historyId, updateDto);
  }

  @Delete('medication-history/:id')
  async deleteMedicationHistory(@Request() req, @Param('id') historyId: string) {
    return this.patientProfileService.deleteMedicationHistory(req.user.id, historyId);
  }

  @Get('dose-calculation-history')
  async getDoseCalculationHistory(@Request() req, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.patientProfileService.getDoseCalculationHistory(req.user.id, limitNum);
  }
}