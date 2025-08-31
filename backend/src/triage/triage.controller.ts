import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TriageService } from './triage.service';
import { TriageDto } from './dto/triage.dto';

@Controller('api/triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Post()
  async evaluateSymptoms(@Body() triageDto: TriageDto) {
    return this.triageService.evaluateSymptoms(triageDto);
  }

  @Get('ingredients')
  async getIngredients() {
    return this.triageService.getIngredients();
  }

  @Get('protocols/:condition')
  async getProtocol(@Param('condition') condition: string) {
    return this.triageService.getLatestProtocol(condition);
  }
}