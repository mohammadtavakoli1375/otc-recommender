import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DoseCalculatorService } from './dose-calculator.service';
import { CalculateDoseDto, DoseCalculationResultDto } from './dto/calculate-dose.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Dose Calculator')
@Controller('dose-calculator')
export class DoseCalculatorController {
  constructor(private readonly doseCalculatorService: DoseCalculatorService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate drug dose based on age and weight' })
  @ApiResponse({
    status: 200,
    description: 'Dose calculated successfully',
    type: DoseCalculationResultDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Drug not found' })
  async calculateDose(
    @Body(ValidationPipe) dto: CalculateDoseDto,
    @Request() req: any,
  ): Promise<DoseCalculationResultDto> {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = req.user?.id || null;
    return this.doseCalculatorService.calculateDose(dto, clientIp, userId);
  }

  @Get('drugs')
  @ApiOperation({ summary: 'Get list of available drugs for dose calculation' })
  @ApiResponse({ status: 200, description: 'Drugs list retrieved successfully' })
  async getDrugsList() {
    return this.doseCalculatorService.getDrugsList();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get calculation history for a user' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  async getCalculationHistory(
    @Query('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.doseCalculatorService.getCalculationHistory(
      userId,
      limit ? parseInt(limit.toString()) : 10,
    );
  }
}