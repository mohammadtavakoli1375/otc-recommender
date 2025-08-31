'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { SafetyWarnings } from './safety-warnings';

interface AddMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMedicationDialog({ open, onOpenChange, onSuccess }: AddMedicationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [safetyWarnings, setSafetyWarnings] = useState<Array<{
    type: 'MAX_DOSE' | 'INTERACTION' | 'CONTRAINDICATION' | 'AGE_RESTRICTION' | 'FREQUENCY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    recommendation?: string;
    icon: string;
    color: string;
  }>>([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [formData, setFormData] = useState({
    drugName: '',
    form: '',
    strength: '',
    notes: '',
    startAt: '',
    endAt: '',
    rule: 'DAILY' as 'DAILY' | 'INTERVAL',
    times: [] as string[],
    intervalHrs: 8,
    maxPerDay: 3,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
    },
  });
  const [newTime, setNewTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('لطفاً وارد شوید');
      }

      // Validation
      if (!formData.drugName.trim()) {
        throw new Error('نام دارو الزامی است');
      }

      if (!formData.startAt) {
        throw new Error('تاریخ شروع الزامی است');
      }

      if (formData.rule === 'DAILY' && formData.times.length === 0) {
        throw new Error('حداقل یک زمان مصرف برای برنامه روزانه الزامی است');
      }

      if (formData.rule === 'INTERVAL' && (!formData.intervalHrs || formData.intervalHrs < 1)) {
        throw new Error('فاصله زمانی باید حداقل 1 ساعت باشد');
      }

      const payload = {
        drugName: formData.drugName.trim(),
        form: formData.form.trim() || undefined,
        strength: formData.strength.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined,
        rule: formData.rule,
        times: formData.rule === 'DAILY' ? formData.times : undefined,
        intervalHrs: formData.rule === 'INTERVAL' ? formData.intervalHrs : undefined,
        maxPerDay: formData.maxPerDay,
        quietHours: formData.quietHours.enabled ? {
          start: formData.quietHours.start,
          end: formData.quietHours.end,
        } : undefined,
      };

      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ایجاد دارو');
      }

      const result = await response.json();
      
      // بررسی هشدارهای ایمنی
      if (result.data?.safetyWarnings && result.data.safetyWarnings.length > 0) {
        setSafetyWarnings(result.data.safetyWarnings);
        setShowWarnings(true);
        return; // منتظر تایید کاربر
      }

      // Reset form
      setFormData({
        drugName: '',
        form: '',
        strength: '',
        notes: '',
        startAt: '',
        endAt: '',
        rule: 'DAILY',
        times: [],
        intervalHrs: 8,
        maxPerDay: 3,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
      });
      setNewTime('');
      setSafetyWarnings([]);
      setShowWarnings(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
    } finally {
      setLoading(false);
    }
  };

  const addTime = () => {
    if (newTime && !formData.times.includes(newTime)) {
      setFormData(prev => ({
        ...prev,
        times: [...prev.times, newTime].sort(),
      }));
      setNewTime('');
    }
  };

  const removeTime = (timeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter(time => time !== timeToRemove),
    }));
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleWarningsAcknowledge = () => {
    // کاربر هشدارها را تایید کرد، فرم را reset کن
    setFormData({
      drugName: '',
      form: '',
      strength: '',
      notes: '',
      startAt: '',
      endAt: '',
      rule: 'DAILY',
      times: [],
      intervalHrs: 8,
      maxPerDay: 3,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00',
      },
    });
    setNewTime('');
    setSafetyWarnings([]);
    setShowWarnings(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showWarnings ? 'هشدارهای ایمنی' : 'افزودن دارو جدید'}
          </DialogTitle>
          <DialogDescription>
            {showWarnings 
              ? 'لطفاً هشدارهای زیر را با دقت مطالعه کنید'
              : 'اطلاعات دارو و برنامه مصرف آن را وارد کنید'
            }
          </DialogDescription>
        </DialogHeader>

        {showWarnings ? (
          <div className="space-y-4">
            <SafetyWarnings 
              warnings={safetyWarnings}
              onAcknowledge={handleWarningsAcknowledge}
              showAcknowledgeButton={true}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowWarnings(false);
                  setSafetyWarnings([]);
                }}
              >
                بازگشت به فرم
              </Button>
            </DialogFooter>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">اطلاعات دارو</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="drugName">نام دارو *</Label>
                <Input
                  id="drugName"
                  value={formData.drugName}
                  onChange={(e) => setFormData(prev => ({ ...prev, drugName: e.target.value }))}
                  placeholder="مثال: استامینوفن"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="form">فرم دارو</Label>
                <Select value={formData.form} onValueChange={(value) => setFormData(prev => ({ ...prev, form: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب فرم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="قرص">قرص</SelectItem>
                    <SelectItem value="کپسول">کپسول</SelectItem>
                    <SelectItem value="شربت">شربت</SelectItem>
                    <SelectItem value="قطره">قطره</SelectItem>
                    <SelectItem value="کرم">کرم</SelectItem>
                    <SelectItem value="پماد">پماد</SelectItem>
                    <SelectItem value="اسپری">اسپری</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="strength">قدرت دارو</Label>
                <Input
                  id="strength"
                  value={formData.strength}
                  onChange={(e) => setFormData(prev => ({ ...prev, strength: e.target.value }))}
                  placeholder="مثال: 500mg یا 5mg/5ml"
                />
              </div>
              
              <div>
                <Label htmlFor="maxPerDay">حداکثر دفعات در روز</Label>
                <Input
                  id="maxPerDay"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxPerDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxPerDay: parseInt(e.target.value) || 3 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">نکات مصرف</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="مثال: با غذا، با آب زیاد، قبل از خواب"
                rows={3}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">بازه زمانی</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startAt">تاریخ شروع *</Label>
                <Input
                  id="startAt"
                  type="date"
                  value={formData.startAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, startAt: e.target.value }))}
                  min={getTodayDate()}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="endAt">تاریخ پایان (اختیاری)</Label>
                <Input
                  id="endAt"
                  type="date"
                  value={formData.endAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, endAt: e.target.value }))}
                  min={formData.startAt || getTodayDate()}
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">برنامه مصرف</h3>
            
            <div>
              <Label>نوع برنامه</Label>
              <Select value={formData.rule} onValueChange={(value: 'DAILY' | 'INTERVAL') => setFormData(prev => ({ ...prev, rule: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">ساعت‌های مشخص در روز</SelectItem>
                  <SelectItem value="INTERVAL">هر چند ساعت یکبار</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.rule === 'DAILY' && (
              <div>
                <Label>ساعت‌های مصرف</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTime} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.times.map((time) => (
                    <Badge key={time} variant="secondary" className="flex items-center gap-1">
                      {time}
                      <button
                        type="button"
                        onClick={() => removeTime(time)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.rule === 'INTERVAL' && (
              <div>
                <Label htmlFor="intervalHrs">فاصله زمانی (ساعت)</Label>
                <Input
                  id="intervalHrs"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.intervalHrs}
                  onChange={(e) => setFormData(prev => ({ ...prev, intervalHrs: parseInt(e.target.value) || 8 }))}
                />
              </div>
            )}
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="quietHours"
                checked={formData.quietHours.enabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: !!checked }
                  }))
                }
              />
              <Label htmlFor="quietHours">ساعات سکوت (عدم ارسال یادآوری)</Label>
            </div>
            
            {formData.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quietStart">شروع سکوت</Label>
                  <Input
                    id="quietStart"
                    type="time"
                    value={formData.quietHours.start}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="quietEnd">پایان سکوت</Label>
                  <Input
                    id="quietEnd"
                    type="time"
                    value={formData.quietHours.end}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'در حال ایجاد...' : 'ایجاد دارو'}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}