import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateProtocolDto, UpdateProtocolDto } from './dto/protocol.dto';
import { CreateIngredientDto, UpdateIngredientDto } from './dto/ingredient.dto';
import { CreateSymptomDto, UpdateSymptomDto } from './dto/symptom.dto';
import { CreateConditionDto, UpdateConditionDto } from './dto/condition.dto';

@Controller('api/admin')
// @UseGuards(AdminGuard) // TODO: Implement authentication
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Overview
  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }

  // Protocols
  @Get('protocols')
  async getProtocols() {
    return this.adminService.getProtocols();
  }

  @Post('protocols')
  async createProtocol(@Body() createProtocolDto: CreateProtocolDto) {
    return this.adminService.createProtocol(createProtocolDto);
  }

  @Put('protocols/:id')
  async updateProtocol(
    @Param('id') id: string,
    @Body() updateProtocolDto: UpdateProtocolDto,
  ) {
    return this.adminService.updateProtocol(id, updateProtocolDto);
  }

  @Post('protocols/:id/publish')
  async publishProtocol(@Param('id') id: string) {
    return this.adminService.publishProtocol(id);
  }

  @Post('protocols/:id/rollback')
  async rollbackProtocol(@Param('id') id: string) {
    return this.adminService.rollbackProtocol(id);
  }

  @Delete('protocols/:id')
  async deleteProtocol(@Param('id') id: string) {
    return this.adminService.deleteProtocol(id);
  }

  // Ingredients
  @Get('ingredients')
  async getIngredients() {
    return this.adminService.getIngredients();
  }

  @Post('ingredients')
  async createIngredient(@Body() createIngredientDto: CreateIngredientDto) {
    return this.adminService.createIngredient(createIngredientDto);
  }

  @Put('ingredients/:id')
  async updateIngredient(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.adminService.updateIngredient(id, updateIngredientDto);
  }

  @Delete('ingredients/:id')
  async deleteIngredient(@Param('id') id: string) {
    return this.adminService.deleteIngredient(id);
  }

  // Symptoms
  @Get('symptoms')
  async getSymptoms() {
    return this.adminService.getSymptoms();
  }

  @Post('symptoms')
  async createSymptom(@Body() createSymptomDto: CreateSymptomDto) {
    return this.adminService.createSymptom(createSymptomDto);
  }

  @Put('symptoms/:id')
  async updateSymptom(
    @Param('id') id: string,
    @Body() updateSymptomDto: UpdateSymptomDto,
  ) {
    return this.adminService.updateSymptom(id, updateSymptomDto);
  }

  @Delete('symptoms/:id')
  async deleteSymptom(@Param('id') id: string) {
    return this.adminService.deleteSymptom(id);
  }

  // Conditions
  @Get('conditions')
  async getConditions() {
    return this.adminService.getConditions();
  }

  @Post('conditions')
  async createCondition(@Body() createConditionDto: CreateConditionDto) {
    return this.adminService.createCondition(createConditionDto);
  }

  @Put('conditions/:id')
  async updateCondition(
    @Param('id') id: string,
    @Body() updateConditionDto: UpdateConditionDto,
  ) {
    return this.adminService.updateCondition(id, updateConditionDto);
  }

  @Delete('conditions/:id')
  async deleteCondition(@Param('id') id: string) {
    return this.adminService.deleteCondition(id);
  }

  // Users
  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  // Releases
  @Get('releases')
  async getReleases() {
    return this.adminService.getReleases();
  }
}