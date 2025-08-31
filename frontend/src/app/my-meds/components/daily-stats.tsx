'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle, Pause, SkipForward } from 'lucide-react';

interface DailyStatsProps {
  stats: {
    due: number;
    sent: number;
    taken: number;
    missed: number;
    snoozed: number;
    skipped: number;
  };
}

export function DailyStats({ stats }: DailyStatsProps) {
  const total = stats.due + stats.sent + stats.taken + stats.missed + stats.snoozed + stats.skipped;
  const completionRate = total > 0 ? Math.round((stats.taken / total) * 100) : 0;

  const statItems = [
    {
      label: 'موعد مصرف',
      value: stats.due,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      label: 'ارسال شده',
      value: stats.sent,
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'مصرف شده',
      value: stats.taken,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'از دست رفته',
      value: stats.missed,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      label: 'به تعویق افتاده',
      value: stats.snoozed,
      icon: Pause,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      label: 'رد شده',
      value: stats.skipped,
      icon: SkipForward,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
  ];

  if (total === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>امروز هیچ دوزی برنامه‌ریزی نشده است</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">آمار امروز</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={completionRate >= 80 ? "default" : completionRate >= 60 ? "secondary" : "destructive"}
              className={completionRate >= 80 ? "bg-green-600" : ""}
            >
              {completionRate}% موفقیت
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`${item.bgColor} ${item.borderColor} border rounded-lg p-3 text-center transition-all hover:shadow-sm`}
              >
                <Icon className={`h-5 w-5 ${item.color} mx-auto mb-1`} />
                <div className={`text-lg font-bold ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-xs text-gray-600 leading-tight">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        {total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>پیشرفت امروز</span>
              <span>{stats.taken} از {total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  completionRate >= 80 
                    ? 'bg-green-600' 
                    : completionRate >= 60 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Motivational Message */}
        {completionRate === 100 && total > 0 && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm text-center font-medium">
              🎉 عالی! تمام دوزهای امروز را مصرف کردید
            </p>
          </div>
        )}
        
        {completionRate < 50 && stats.missed > 0 && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-800 text-sm text-center">
              💡 سعی کنید یادآوری‌ها را فعال نگه دارید تا دوزهایتان را از دست ندهید
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}