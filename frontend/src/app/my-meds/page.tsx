'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pill } from 'lucide-react';
import { AddMedicationDialog } from './components/add-medication-dialog';
import { MedicationCard } from './components/medication-card';
import { DailyStats } from './components/daily-stats';

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

interface DailyStatsData {
  due: number;
  sent: number;
  taken: number;
  missed: number;
  snoozed: number;
  skipped: number;
}

export default function MyMedsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStatsData | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedications();
    fetchDailyStats();
  }, []);

  const fetchMedications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch('/api/medications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت لیست داروها');
      }

      const result = await response.json();
      setMedications(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/medications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setDailyStats(result.data);
      }
    } catch (err) {
      console.error('خطا در دریافت آمار:', err);
    }
  };

  const handleMedicationAdded = () => {
    fetchMedications();
    fetchDailyStats();
    setIsAddDialogOpen(false);
  };

  const handleMedicationAction = async (adherenceId: string, action: 'taken' | 'snooze' | 'skip', snoozeMinutes?: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/medications/adherence/${adherenceId}/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          snoozeMinutes,
        }),
      });

      if (response.ok) {
        fetchMedications();
        fetchDailyStats();
      } else {
        throw new Error('خطا در ثبت عملیات');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
    }
  };

  const getNextDoseTime = (medication: Medication): string | null => {
    if (!medication.adherence.length) return null;
    
    const nextDose = medication.adherence.find(a => a.status === 'due' || a.status === 'sent');
    if (!nextDose) return null;

    const dueTime = new Date(nextDose.dueAt);
    const now = new Date();
    
    if (dueTime <= now) {
      return 'الان';
    }
    
    const diffMs = dueTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours} ساعت و ${diffMinutes} دقیقه`;
    } else {
      return `${diffMinutes} دقیقه`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            داروهای من
          </h1>
          <p className="text-gray-600">
            مدیریت برنامه دارویی و یادآوری دوزها
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          variant="default"
          size="auth"
          className="w-full sm:w-auto"
        >
          <Plus className="ml-2 h-5 w-5" />
          افزودن دارو
        </Button>
      </div>

      {/* Daily Stats */}
      {dailyStats && <DailyStats stats={dailyStats} />}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <Button 
            variant="outline" 
            size="md" 
            onClick={() => setError(null)}
            className="mt-2 w-full sm:w-auto"
          >
            بستن
          </Button>
        </div>
      )}

      {/* Medications List */}
      {medications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              هنوز دارویی اضافه نکرده‌اید
            </h3>
            <p className="text-gray-600 mb-6">
              برای شروع، اولین دارو خود را اضافه کنید
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              variant="default"
              size="auth"
              className="w-full sm:w-auto"
            >
              <Plus className="ml-2 h-5 w-5" />
              افزودن اولین دارو
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {medications.map((medication) => {
            const nextDoseTime = getNextDoseTime(medication);
            const nextDose = medication.adherence.find(a => a.status === 'due' || a.status === 'sent');
            
            return (
              <MedicationCard
                key={medication.id}
                medication={medication}
                nextDoseTime={nextDoseTime}
                nextDose={nextDose}
                onAction={handleMedicationAction}
                onRefresh={() => {
                  fetchMedications();
                  fetchDailyStats();
                }}
              />
            );
          })}
        </div>
      )}

      {/* Add Medication Dialog */}
      <AddMedicationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleMedicationAdded}
      />
    </div>
  );
}