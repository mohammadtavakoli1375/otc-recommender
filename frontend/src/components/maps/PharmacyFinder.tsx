'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, Phone, Clock, X, Search, Loader2, AlertTriangle } from 'lucide-react';

interface Pharmacy {
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

interface PharmacyFinderProps {
  onClose: () => void;
}

const PharmacyFinder: React.FC<PharmacyFinderProps> = ({ onClose }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [searchRadius, setSearchRadius] = useState<number>(15000);
  const [searchAddress, setSearchAddress] = useState<string>('');

  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.');
      setLocationPermission('denied');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('درخواست دسترسی به موقعیت دقیق کاربر...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      console.log(`مختصات دقیق کاربر: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
      console.log(`دقت موقعیت: ${position.coords.accuracy} متر`);
      
      setUserLocation(location);
      setLocationPermission('granted');
      await searchNearbyPharmacies(location);
    } catch (error: any) {
      console.error('خطا در دریافت موقعیت:', error);
      setLocationPermission('denied');
      
      if (error.code === 1) {
        setError('برای یافتن داروخانه‌های اطراف، لطفاً اجازه دسترسی به موقعیت را فعال کنید.');
      } else if (error.code === 2) {
        setError('موقعیت شما در دسترس نیست. لطفاً GPS دستگاه خود را فعال کنید.');
      } else if (error.code === 3) {
        setError('زمان درخواست موقعیت به پایان رسید. لطفاً دوباره تلاش کنید.');
      } else {
        setError('خطا در دریافت موقعیت. لطفاً دوباره تلاش کنید.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // جستجوی داروخانه‌های اطراف
  const searchNearbyPharmacies = useCallback(async (location: { lat: number; lng: number }) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`جستجوی داروخانه‌ها در مختصات: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
      console.log(`شعاع جستجو: ${searchRadius} متر`);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${apiUrl}/maps/nearby?lat=${location.lat}&lng=${location.lng}&radius=${searchRadius}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('پاسخ API:', data);
      
      if (data.success && data.data) {
        setPharmacies(data.data);
        console.log(`${data.data.length} داروخانه یافت شد`);
        
        if (data.data.length === 0) {
          setError(`هیچ داروخانه‌ای در شعاع ${searchRadius / 1000} کیلومتری یافت نشد. شعاع جستجو را افزایش دهید.`);
        }
      } else {
        setError('خطا در دریافت اطلاعات داروخانه‌ها');
      }
    } catch (error: any) {
      console.error('خطا در جستجوی داروخانه‌ها:', error);
      setError(error.message || 'خطا در دریافت اطلاعات داروخانه‌ها');
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  }, [searchRadius]);

  // تغییر شعاع جستجو
  const handleRadiusChange = useCallback((newRadius: number) => {
    setSearchRadius(newRadius);
    if (userLocation) {
      searchNearbyPharmacies(userLocation);
    }
  }, [userLocation, searchNearbyPharmacies]);

  // تماس با داروخانه
  const callPharmacy = useCallback(() => {
    alert('شماره تماس داروخانه در دسترس نیست. لطفاً از طریق مسیریابی به داروخانه مراجعه کنید.');
  }, []);

  // مسیریابی به داروخانه
  const navigateToPharmacy = useCallback((pharmacy: Pharmacy) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`;
    window.open(url, '_blank');
  }, []);

  // جستجو با آدرس
  const searchByAddress = useCallback(async () => {
    if (!searchAddress.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // اینجا باید API geocoding را صدا بزنیم
      // فعلاً یک پیام نمایش می‌دهیم
      setError('جستجو با آدرس در حال توسعه است. لطفاً از موقعیت فعلی استفاده کنید.');
    } catch (error: any) {
      setError('خطا در جستجوی آدرس');
    } finally {
      setLoading(false);
    }
  }, [searchAddress]);

  // باز کردن در نقشه
  const openInMaps = useCallback((lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 text-right">
            🏥 یافتن نزدیک‌ترین داروخانه‌ها
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="space-y-4">
            {/* دکمه دسترسی به موقعیت */}
            <div className="text-center">
              <Button
                onClick={requestLocationPermission}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
                {loading ? 'در حال یافتن موقعیت...' : 'استفاده از موقعیت دقیق من'}
              </Button>
            </div>

            {/* تنظیمات شعاع جستجو */}
            {userLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-right text-sm">تنظیمات جستجو</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-right">
                      <label className="text-sm font-medium text-gray-700">
                        شعاع جستجو: {searchRadius / 1000} کیلومتر
                      </label>
                      <Input
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={searchRadius}
                        onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 کم</span>
                        <span>50 کم</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* اطلاعات موقعیت */}
            {userLocation && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription className="text-right">
                  موقعیت شما: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </AlertDescription>
              </Alert>
            )}

            {/* نمایش خطا */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-right">{error}</AlertDescription>
              </Alert>
            )}

            {/* راهنما برای کاربران بدون دسترسی */}
            {locationPermission === 'denied' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      دسترسی به موقعیت مورد نیاز است
                    </h3>
                    <p className="text-sm text-gray-600">
                      برای یافتن داروخانه‌های اطراف، لطفاً دسترسی به موقعیت را در مرورگر خود فعال کنید.
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• روی آیکون قفل در نوار آدرس کلیک کنید</p>
                      <p>• گزینه "موقعیت" را روی "اجازه" تنظیم کنید</p>
                      <p>• صفحه را مجدداً بارگذاری کنید</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* نتایج */}
            {pharmacies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">
                    داروخانه‌های یافت شده ({pharmacies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pharmacies.map((pharmacy) => (
                       <Card key={pharmacy.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="text-right space-y-3">
                              {/* نام و دسته‌بندی */}
                              <div className="space-y-1">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {pharmacy.name}
                                </h4>
                                {pharmacy.category && (
                                  <p className="text-xs text-gray-500">
                                    {pharmacy.category}
                                  </p>
                                )}
                                {pharmacy.type && pharmacy.type !== pharmacy.category && (
                                  <p className="text-xs text-gray-400">
                                    نوع: {pharmacy.type}
                                  </p>
                                )}
                              </div>

                              {/* آدرس */}
                              <div className="space-y-1">
                                <p className="text-sm text-gray-700">
                                  📍 {pharmacy.address}
                                </p>
                                {pharmacy.vicinity && pharmacy.vicinity !== pharmacy.address && (
                                  <p className="text-xs text-gray-500">
                                    🏘️ {pharmacy.vicinity}
                                  </p>
                                )}
                              </div>

                              {/* فاصله */}
                              <div className="flex items-center justify-end">
                                <Badge variant="secondary">
                                  📏 {pharmacy.distance} کیلومتر
                                </Badge>
                              </div>
                            </div>

                            {/* دکمه‌های عمل */}
                            <div className="flex gap-2 mt-4">
                              <Button
                                onClick={() => openInMaps(pharmacy.location.lat, pharmacy.location.lng)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                size="sm"
                              >
                                <Navigation className="w-4 h-4 mr-1" />
                                مسیریابی
                              </Button>
                              <Button
                                 onClick={() => callPharmacy()}
                                 className="flex-1 bg-green-600 hover:bg-green-700"
                                 size="sm"
                               >
                                 <Phone className="w-4 h-4 mr-1" />
                                 تماس
                               </Button>
                            </div>
                          </CardContent>
                        </Card>
                     ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyFinder;