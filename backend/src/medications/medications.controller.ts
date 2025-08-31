import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { MarkMedicationDto } from './dto/mark-medication.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('medications')
@UseGuards(JwtAuthGuard)
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  async create(@Request() req, @Body() createMedicationDto: CreateMedicationDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'دارو با موفقیت ایجاد شد',
      data: await this.medicationsService.create(req.user.userId, createMedicationDto),
    };
  }

  @Get()
  async findAll(@Request() req) {
    return {
      statusCode: HttpStatus.OK,
      data: await this.medicationsService.findAll(req.user.userId),
    };
  }

  @Get('stats')
  async getDailyStats(@Request() req, @Query('date') date?: string) {
    return {
      statusCode: HttpStatus.OK,
      data: await this.medicationsService.getDailyStats(req.user.userId, date),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return {
      statusCode: HttpStatus.OK,
      data: await this.medicationsService.findOne(id, req.user.userId),
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateMedicationDto: UpdateMedicationDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'دارو با موفقیت به‌روزرسانی شد',
      data: await this.medicationsService.update(id, req.user.userId, updateMedicationDto),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return {
      statusCode: HttpStatus.OK,
      ...(await this.medicationsService.remove(id, req.user.userId)),
    };
  }

  @Post(':id/schedule')
  async updateSchedule(
    @Param('id') id: string,
    @Request() req,
    @Body() scheduleDto: any, // TODO: Create proper DTO
  ) {
    // این endpoint برای به‌روزرسانی جداگانه برنامه زمان‌بندی است
    return {
      statusCode: HttpStatus.OK,
      message: 'برنامه زمان‌بندی به‌روزرسانی شد',
    };
  }

  @Post('adherence/:adherenceId/mark')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async markAdherence(
    @Param('adherenceId') adherenceId: string,
    @Request() req,
    @Body() markDto: MarkMedicationDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: `دوز با موفقیت ${markDto.action === 'taken' ? 'مصرف شد' : markDto.action === 'skip' ? 'رد شد' : 'به تعویق افتاد'}`,
      data: await this.medicationsService.markAdherence(adherenceId, req.user.userId, markDto),
    };
  }
}