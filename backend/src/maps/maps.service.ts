import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface NeshanSearchResponse {
  items: Array<{
    title: string;
    address: string;
    vicinity?: string;
    location: {
      x: number; // lng
      y: number; // lat
    };
    category?: string;
    type?: string;
  }>;
}

export interface PharmacyResult {
  id: string;
  name: string;
  address: string;
  vicinity?: string;
  distance: number;
  location: {
    lat: number;
    lng: number;
  };
  category?: string;
  type?: string;
}

@Injectable()
export class MapsService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly searchPath: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('NESHAN_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('NESHAN_BASE_URL') || 'https://api.neshan.org';
    this.searchPath = this.configService.get<string>('NESHAN_SEARCH_PATH') || '/v1/search';
    

    if (!this.apiKey) {
      console.warn('Neshan API key not configured');
    }
  }

  async findNearbyPharmacies(
    lat: number,
    lng: number,
    radius: number = 15000,
  ): Promise<PharmacyResult[]> {
    if (!this.apiKey) {
      throw new HttpException(
        'Neshan API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const url = `${this.baseUrl}${this.searchPath}`;
      const headers = { 'Api-Key': this.apiKey };
      const params = {
        term: 'داروخانه',
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
      };

      console.log(`جستجوی داروخانه در مختصات: ${lat}, ${lng} با شعاع ${radius} متر`);

      const { data } = await firstValueFrom(
        this.httpService.get<NeshanSearchResponse>(url, { params, headers })
      );

      if (!data || !data.items) {
        return [];
      }

      // تبدیل نتایج نشان به فرمت استاندارد
      const pharmacies = data.items.map((item, index) => {
        const distance = this.calculateDistance(
          lat,
          lng,
          item.location.y,
          item.location.x,
        );

        return {
          id: `neshan-pharmacy-${index + 1}`,
          name: item.title || `داروخانه ${index + 1}`,
          address: item.address || 'آدرس نامشخص',
          vicinity: item.vicinity || undefined,
          distance: Math.round(distance * 10) / 10, // گرد کردن به یک رقم اعشار
          location: {
            lat: item.location.y,
            lng: item.location.x,
          },
          category: item.category || undefined,
          type: item.type || undefined,
        };
      });

      // مرتب‌سازی بر اساس فاصله (الگوریتم هاورساین)
      const sortedPharmacies = pharmacies
        .filter(pharmacy => pharmacy.distance <= radius / 1000) // فیلتر بر اساس شعاع
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20); // محدود کردن به 20 نتیجه

      console.log(`${sortedPharmacies.length} داروخانه یافت شد`);
      return sortedPharmacies;

    } catch (error) {
      console.error('خطا در جستجوی داروخانه‌ها از نشان API:', error);
      
      if (error.response?.status === 401) {
        throw new HttpException(
          'Invalid Neshan API key',
          HttpStatus.UNAUTHORIZED,
        );
      }
      
      if (error.response?.status === 429) {
        throw new HttpException(
          'Neshan API rate limit exceeded',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      
      throw new HttpException(
        'Failed to search pharmacies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // محاسبه فاصله با فرمول هاورساین
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // شعاع زمین به کیلومتر
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // فاصله به کیلومتر
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}