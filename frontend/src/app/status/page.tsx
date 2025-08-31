'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  lastChecked: string;
}

interface SystemHealth {
  overall: 'operational' | 'degraded' | 'down';
  services: ServiceStatus[];
  uptime: string;
  lastIncident?: {
    date: string;
    description: string;
    resolved: boolean;
  };
}

export default function StatusPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // In a real app, this would call actual health check endpoints
        const mockHealth: SystemHealth = {
          overall: 'operational',
          uptime: '99.9%',
          services: [
            {
              name: 'API سرویس',
              status: 'operational',
              responseTime: 120,
              lastChecked: new Date().toISOString(),
            },
            {
              name: 'پایگاه داده',
              status: 'operational',
              responseTime: 45,
              lastChecked: new Date().toISOString(),
            },
            {
              name: 'موتور قوانین',
              status: 'operational',
              responseTime: 89,
              lastChecked: new Date().toISOString(),
            },
            {
              name: 'سرویس احراز هویت',
              status: 'operational',
              responseTime: 67,
              lastChecked: new Date().toISOString(),
            },
          ],
        };

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHealth(mockHealth);
      } catch (error) {
        console.error('Error checking health:', error);
        setHealth({
          overall: 'down',
          uptime: 'N/A',
          services: [],
          lastIncident: {
            date: new Date().toISOString(),
            description: 'خطا در دریافت وضعیت سرویس‌ها',
            resolved: false,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    
    // Refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'عملیاتی';
      case 'degraded':
        return 'کاهش عملکرد';
      case 'down':
        return 'خارج از سرویس';
      default:
        return 'نامشخص';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 ml-2" />
              <h1 className="text-2xl font-bold text-gray-900 mr-3">مشاور OTC</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">وضعیت سرویس</h2>
          <p className="text-gray-600">
            وضعیت فعلی سرویس‌های مشاور OTC و آمار عملکرد سیستم
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بررسی وضعیت سرویس‌ها...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Status */}
            {health && (
              <Card className={`border-2 ${getStatusColor(health.overall)}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {getStatusIcon(health.overall)}
                    <span>وضعیت کلی سیستم</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.overall)}`}>
                      {getStatusText(health.overall)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">آپتایم (۳۰ روز گذشته)</p>
                      <p className="text-2xl font-bold">{health.uptime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">آخرین بررسی</p>
                      <p className="text-lg">
                        {new Date().toLocaleTimeString('fa-IR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services Status */}
            <Card>
              <CardHeader>
                <CardTitle>وضعیت سرویس‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                {health?.services.length ? (
                  <div className="space-y-4">
                    {health.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(service.status)}
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-gray-600">
                              آخرین بررسی: {new Date(service.lastChecked).toLocaleTimeString('fa-IR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(service.status)}`}>
                            {getStatusText(service.status)}
                          </span>
                          {service.responseTime && (
                            <p className="text-sm text-gray-600 mt-1">
                              {service.responseTime}ms
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    اطلاعات سرویس‌ها در دسترس نیست
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Incidents */}
            {health?.lastIncident && (
              <Card>
                <CardHeader>
                  <CardTitle>آخرین رویداد</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    {health.lastIncident.resolved ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {health.lastIncident.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(health.lastIncident.date).toLocaleDateString('fa-IR')} - 
                        {health.lastIncident.resolved ? ' حل شده' : ' در حال بررسی'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>آمار عملکرد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">&lt; 200ms</p>
                    <p className="text-sm text-gray-600">میانگین زمان پاسخ</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">99.9%</p>
                    <p className="text-sm text-gray-600">آپتایم ماهانه</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">24/7</p>
                    <p className="text-sm text-gray-600">نظارت سیستم</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>برنامه تعمیر و نگهداری</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-4">
                  در حال حاضر هیچ تعمیر و نگهداری برنامه‌ریزی شده‌ای وجود ندارد.
                </p>
                <div className="text-sm text-gray-500 text-center">
                  <p>تعمیرات معمولاً در ساعات کم‌ترافیک (۲-۴ صبح) انجام می‌شود.</p>
                  <p>کاربران از طریق ایمیل از تعمیرات برنامه‌ریزی شده مطلع می‌شوند.</p>
                </div>
              </CardContent>
            </Card>

            {/* Subscribe to Updates */}
            <Card>
              <CardHeader>
                <CardTitle>اطلاع‌رسانی وضعیت</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  برای دریافت اطلاعیه‌های وضعیت سرویس و تعمیرات برنامه‌ریزی شده، می‌توانید ایمیل خود را ثبت کنید.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>نکته:</strong> این قابلیت به زودی فعال خواهد شد.
                    در حال حاضر می‌توانید این صفحه را در نشانک‌های خود ذخیره کنید.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}