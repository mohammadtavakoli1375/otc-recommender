import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProtocolDto, UpdateProtocolDto } from './dto/protocol.dto';
import { CreateIngredientDto, UpdateIngredientDto } from './dto/ingredient.dto';
import { CreateSymptomDto, UpdateSymptomDto } from './dto/symptom.dto';
import { CreateConditionDto, UpdateConditionDto } from './dto/condition.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [protocolsCount, ingredientsCount, symptomsCount, conditionsCount, usersCount] = await Promise.all([
      this.prisma.protocol.count(),
      this.prisma.ingredient.count(),
      this.prisma.symptom.count(),
      this.prisma.condition.count(),
      this.prisma.user.count(),
    ]);

    const recentProtocols = await this.prisma.protocol.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        condition: true,
        creator: true,
      },
    });

    return {
      stats: {
        protocols: protocolsCount,
        ingredients: ingredientsCount,
        symptoms: symptomsCount,
        conditions: conditionsCount,
        users: usersCount,
      },
      recentProtocols,
    };
  }

  // Protocol methods
  async getProtocols() {
    return this.prisma.protocol.findMany({
      include: {
        condition: true,
        creator: true,
        recommendations: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createProtocol(createProtocolDto: CreateProtocolDto) {
    return this.prisma.protocol.create({
      data: createProtocolDto,
      include: {
        condition: true,
        creator: true,
      },
    });
  }

  async updateProtocol(id: string, updateProtocolDto: UpdateProtocolDto) {
    const protocol = await this.prisma.protocol.findUnique({ where: { id } });
    if (!protocol) {
      throw new NotFoundException('Protocol not found');
    }

    return this.prisma.protocol.update({
      where: { id },
      data: updateProtocolDto,
      include: {
        condition: true,
        creator: true,
      },
    });
  }

  async publishProtocol(id: string) {
    const protocol = await this.prisma.protocol.findUnique({ where: { id } });
    if (!protocol) {
      throw new NotFoundException('Protocol not found');
    }

    return this.prisma.protocol.update({
      where: { id },
      data: { published_at: new Date() },
      include: {
        condition: true,
        creator: true,
      },
    });
  }

  async rollbackProtocol(id: string) {
    const protocol = await this.prisma.protocol.findUnique({ where: { id } });
    if (!protocol) {
      throw new NotFoundException('Protocol not found');
    }

    return this.prisma.protocol.update({
      where: { id },
      data: { published_at: null },
      include: {
        condition: true,
        creator: true,
      },
    });
  }

  async deleteProtocol(id: string) {
    const protocol = await this.prisma.protocol.findUnique({ where: { id } });
    if (!protocol) {
      throw new NotFoundException('Protocol not found');
    }

    return this.prisma.protocol.delete({ where: { id } });
  }

  // Ingredient methods
  async getIngredients() {
    return this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createIngredient(createIngredientDto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: createIngredientDto,
    });
  }

  async updateIngredient(id: string, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    return this.prisma.ingredient.update({
      where: { id },
      data: updateIngredientDto,
    });
  }

  async deleteIngredient(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    return this.prisma.ingredient.delete({ where: { id } });
  }

  // Symptom methods
  async getSymptoms() {
    return this.prisma.symptom.findMany({
      orderBy: { name_en: 'asc' },
    });
  }

  async createSymptom(createSymptomDto: CreateSymptomDto) {
    return this.prisma.symptom.create({
      data: createSymptomDto,
    });
  }

  async updateSymptom(id: string, updateSymptomDto: UpdateSymptomDto) {
    const symptom = await this.prisma.symptom.findUnique({ where: { id } });
    if (!symptom) {
      throw new NotFoundException('Symptom not found');
    }

    return this.prisma.symptom.update({
      where: { id },
      data: updateSymptomDto,
    });
  }

  async deleteSymptom(id: string) {
    const symptom = await this.prisma.symptom.findUnique({ where: { id } });
    if (!symptom) {
      throw new NotFoundException('Symptom not found');
    }

    return this.prisma.symptom.delete({ where: { id } });
  }

  // Condition methods
  async getConditions() {
    return this.prisma.condition.findMany({
      include: {
        protocols: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
      orderBy: { title_en: 'asc' },
    });
  }

  async createCondition(createConditionDto: CreateConditionDto) {
    return this.prisma.condition.create({
      data: createConditionDto,
    });
  }

  async updateCondition(id: string, updateConditionDto: UpdateConditionDto) {
    const condition = await this.prisma.condition.findUnique({ where: { id } });
    if (!condition) {
      throw new NotFoundException('Condition not found');
    }

    return this.prisma.condition.update({
      where: { id },
      data: updateConditionDto,
    });
  }

  async deleteCondition(id: string) {
    const condition = await this.prisma.condition.findUnique({ where: { id } });
    if (!condition) {
      throw new NotFoundException('Condition not found');
    }

    return this.prisma.condition.delete({ where: { id } });
  }

  // User methods
  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: { email: 'asc' },
    });
  }

  // Release methods
  async getReleases() {
    return this.prisma.protocol.findMany({
      where: { published_at: { not: null } },
      include: {
        condition: true,
        creator: true,
      },
      orderBy: { published_at: 'desc' },
    });
  }
}