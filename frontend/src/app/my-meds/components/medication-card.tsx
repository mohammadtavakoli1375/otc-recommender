'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, Pill, MoreVertical, Check, Clock3, X, Trash2, Edit } from 'lucide-react';

interface Medication {
  id: string;
  drugName: string;
  form?: string;
  strength?: string;
  notes?: string;
  startAt: string;
  endAt?: string;
  schedule: {
    rule: string;
    times?: string[];
    intervalHrs?: number;
    maxPerDay?: number;
    quietHours?: {
      start: string;
      end: string;
    };
  };
  adherence: Array<{
    id: string;
    dueAt: string;
    status: string;
    takenAt?: string;
  }>;
}

interface MedicationCardProps {
  medication: Medication;
  nextDoseTime: string | null;
  nextDose?: {
    id: string;
    dueAt: string;
    status: string;
    takenAt?: string;
  };
  onAction: (adherenceId: string, action: 'taken' | 'snooze' | 'skip', snoozeMinutes?: number) => Promise<void>;
  onRefresh: () => void;
}

export function MedicationCard({ medication, nextDoseTime, nextDose, onAction, onRefresh }: MedicationCardProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAction = async (action: 'taken' | 'snooze' | 'skip', snoozeMinutes?: number) => {
    if (!nextDose) return;
    
    setActionLoading(action);
    try {
      await onAction(nextDose.id, action, snoozeMinutes);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/medications/${medication.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('خطا در حذف دارو:', error);
    }
    setShowDeleteDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'due':
        return <Badge variant="destructive">موعد مصرف</Badge>;
      case 'sent':
        return <Badge variant="secondary">ارسال شده</Badge>;
      case 'taken':
        return <Badge variant="default" className="bg-green-600">مصرف شده</Badge>;
      case 'missed':
        return <Badge variant="destructive">از دست رفته</Badge>;
      case 'snoozed':
        return <Badge variant="outline">به تعویق افتاده</Badge>;
      case 'skipped':
        return <Badge variant="outline">رد شده</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatSchedule = () => {
    const schedule = medication.schedule;
    if (schedule.rule === 'DAILY' && schedule.times) {
      return `روزانه در ساعت‌های: ${schedule.times.join('، ')}`;
    } else if (schedule.rule === 'INTERVAL' && schedule.intervalHrs) {
      return `هر ${schedule.intervalHrs} ساعت یکبار`;
    }
    return 'برنامه تعریف نشده';
  };

  const isOverdue = nextDose && nextDose.status === 'sent' && new Date(nextDose.dueAt) < new Date();

  return (
    <>
      <Card className={`transition-all duration-200 ${isOverdue ? 'ring-2 ring-red-200 bg-red-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                {medication.drugName}
                {medication.strength && (
                  <span className="text-sm font-normal text-gray-600">
                    ({medication.strength})
                  </span>
                )}
              </CardTitle>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {medication.form && (
                  <Badge variant="outline" className="text-xs">
                    {medication.form}
                  </Badge>
                )}
                {nextDose && getStatusBadge(nextDose.status)}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 ml-2" />
                  ویرایش
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Schedule Info */}
          <div className="text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatSchedule()}
            </p>
            {medication.schedule.quietHours && (
              <p className="mt-1">
                ساعات سکوت: {medication.schedule.quietHours.start} تا {medication.schedule.quietHours.end}
              </p>
            )}
          </div>

          {/* Notes */}
          {medication.notes && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>نکات:</strong> {medication.notes}
              </p>
            </div>
          )}

          {/* Next Dose */}
          {nextDoseTime && nextDose && (
            <div className={`rounded-lg p-3 ${isOverdue ? 'bg-red-100' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">
                    {isOverdue ? '⚠️ دوز از موعد گذشته' : '⏰ دوز بعدی'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {nextDoseTime === 'الان' ? 'الان' : `${nextDoseTime} دیگر`}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(nextDose.dueAt).toLocaleTimeString('fa-IR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              
              {/* Action Buttons */}
              {(nextDose.status === 'due' || nextDose.status === 'sent') && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAction('taken')}
                    disabled={!!actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === 'taken' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Check className="h-4 w-4 ml-1" />
                    )}
                    مصرف شد
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!!actionLoading}
                        className="flex-1 sm:flex-none"
                      >
                        {actionLoading === 'snooze' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                        ) : (
                          <Clock3 className="h-4 w-4 ml-1" />
                        )}
                        به تعویق
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleAction('snooze', 15)}>
                        15 دقیقه دیگر
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('snooze', 30)}>
                        30 دقیقه دیگر
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('snooze', 60)}>
                        1 ساعت دیگر
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction('skip')}
                    disabled={!!actionLoading}
                    className="flex-1 sm:flex-none text-red-600 hover:text-red-700"
                  >
                    {actionLoading === 'skip' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                    ) : (
                      <X className="h-4 w-4 ml-1" />
                    )}
                    رد کردن
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Date Range */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <p>
              شروع: {new Date(medication.startAt).toLocaleDateString('fa-IR')}
              {medication.endAt && (
                <> • پایان: {new Date(medication.endAt).toLocaleDateString('fa-IR')}</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف دارو</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید دارو &quot;{medication.drugName}&quot; را حذف کنید؟
              این عمل قابل بازگشت نیست و تمام یادآوری‌های مربوطه نیز حذف خواهند شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}