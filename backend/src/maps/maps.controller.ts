import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MapsService, PharmacyResult } from './maps.service';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('nearby')
  async findNearbyPharmacies(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ): Promise<{
    success: boolean;
    data: PharmacyResult[];
    meta: {
      count: number;
      coordinates: { lat: number; lng: number };
      radius: number;
    };
  }> {
    // اعتبارسنجی پارامترها
    if (!lat || !lng) {
      throw new HttpException(
        'مختصات جغرافیایی (lat, lng) الزامی است',
        HttpStatus.BAD_REQUEST,
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = radius ? parseInt(radius, 10) : 15000;

    // بررسی صحت مختصات
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new HttpException(
        'مختصات جغرافیایی نامعتبر است',
        HttpStatus.BAD_REQUEST,
      );
    }

    // بررسی محدوده مختصات
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new HttpException(
        'مختصات جغرافیایی خارج از محدوده مجاز است',
        HttpStatus.BAD_REQUEST,
      );
    }

    // بررسی شعاع جستجو
    if (isNaN(searchRadius) || searchRadius < 100 || searchRadius > 50000) {
      throw new HttpException(
        'شعاع جستجو باید بین 100 تا 50000 متر باشد',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const pharmacies = await this.mapsService.findNearbyPharmacies(
        latitude,
        longitude,
        searchRadius,
      );

      return {
        success: true,
        data: pharmacies,
        meta: {
          count: pharmacies.length,
          coordinates: {
            lat: latitude,
            lng: longitude,
          },
          radius: searchRadius,
        },
      };
    } catch (error) {
      console.error('خطا در کنترلر جستجوی داروخانه:', error);
      throw error;
    }
  }
}