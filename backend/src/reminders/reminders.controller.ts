import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private remindersService: RemindersService) {}

  @Post()
  async createReminder(@Request() req, @Body() createDto: CreateReminderDto) {
    return this.remindersService.createReminder(req.user.id, createDto);
  }

  @Get()
  async getUserReminders(@Request() req) {
    return this.remindersService.getUserReminders(req.user.id);
  }

  @Get('active')
  async getActiveReminders(@Request() req) {
    return this.remindersService.getActiveReminders(req.user.id);
  }

  @Put(':id')
  async updateReminder(
    @Request() req,
    @Param('id') reminderId: string,
    @Body() updateDto: UpdateReminderDto
  ) {
    return this.remindersService.updateReminder(req.user.id, reminderId, updateDto);
  }

  @Delete(':id')
  async deleteReminder(@Request() req, @Param('id') reminderId: string) {
    return this.remindersService.deleteReminder(req.user.id, reminderId);
  }

  @Put(':id/toggle')
  async toggleReminder(@Request() req, @Param('id') reminderId: string) {
    return this.remindersService.toggleReminder(req.user.id, reminderId);
  }

  @Get(':id/calendar/ical')
  async getICalendar(@Request() req, @Param('id') reminderId: string) {
    return this.remindersService.generateCalendarEvents(req.user.id, reminderId, 'ical');
  }

  @Get(':id/calendar/google')
  async getGoogleCalendarUrl(@Request() req, @Param('id') reminderId: string) {
    return this.remindersService.generateCalendarEvents(req.user.id, reminderId, 'google');
  }
}