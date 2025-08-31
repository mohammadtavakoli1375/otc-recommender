'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Clock,
  Bell,
  MessageSquare,
  Mail,
  Plus,
  // Trash2,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface DeliveryChannel {
  id: 'push' | 'sms' | 'email';
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  available: boolean;
  description: string;
}

interface ReminderFormData {
  title: string;
  description: string;
  medicationName: string;
  dosage: string;
  startDate: string;
  endDate: string;
  timesPerDay: number;
  specificTimes: string[];
  deliveryChannels: string[];
  notificationEnabled: boolean;
}

interface EnhancedReminderFormProps {
  onSubmit: (data: ReminderFormData) => Promise<void>;
  initialData?: Partial<ReminderFormData>;
  isEditing?: boolean;
  userPreferences?: {
    push: boolean;
    sms: boolean;
    email: boolean;
  };
  userPhone?: string;
  phoneVerified?: boolean;
}

export function EnhancedReminderForm({
  onSubmit,
  initialData = {},
  isEditing = false,
  userPreferences = { push: true, sms: true, email: false },
  userPhone = '',
  phoneVerified = false,
}: EnhancedReminderFormProps) {
  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    description: '',
    medicationName: '',
    dosage: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    timesPerDay: 1,
    specificTimes: ['08:00'],
    deliveryChannels: ['push'],
    notificationEnabled: true,
    ...initialData,
  });

  const [deliveryChannels, setDeliveryChannels] = useState<DeliveryChannel[]>([
    {
      id: 'push',
      name: 'اعلانات مرورگر',
      icon: <Bell className="w-4 h-4" />,
      enabled: true,
      available: true,
      description: 'اعلان فوری در مرورگر',
    },
    {
      id: 'sms',
      name: 'پیامک',
      icon: <MessageSquare className="w-4 h-4" />,
      enabled: false,
      available: phoneVerified && userPreferences.sms,
      description: phoneVerified ? `ارسال به ${userPhone}` : 'نیاز به تأیید شماره موبایل',
    },
    {
      id: 'email',
      name: 'ایمیل',
      icon: <Mail className="w-4 h-4" />,
      enabled: false,
      available: false,
      description: 'به‌زودی در دسترس',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Update delivery channels based on user preferences and phone verification
    setDeliveryChannels(prev => prev.map(channel => ({
      ...channel,
      available: channel.id === 'push' ? true :
                channel.id === 'sms' ? phoneVerified && userPreferences.sms :
                channel.id === 'email' ? userPreferences.email : false,
      enabled: formData.deliveryChannels.includes(channel.id),
    })));
  }, [userPreferences, phoneVerified, formData.deliveryChannels]);

  const handleInputChange = (field: keyof ReminderFormData, value: string | number | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleTimesPerDayChange = (times: number) => {
    const newTimes = Math.max(1, Math.min(6, times));
    const currentTimes = formData.specificTimes;
    
    let newSpecificTimes: string[];
    if (newTimes > currentTimes.length) {
      // Add more times
      newSpecificTimes = [...currentTimes];
      const defaultTimes = ['08:00', '12:00', '18:00', '22:00', '06:00', '14:00'];
      for (let i = currentTimes.length; i < newTimes; i++) {
        newSpecificTimes.push(defaultTimes[i] || '08:00');
      }
    } else {
      // Remove excess times
      newSpecificTimes = currentTimes.slice(0, newTimes);
    }
    
    setFormData(prev => ({
      ...prev,
      timesPerDay: newTimes,
      specificTimes: newSpecificTimes,
    }));
  };

  const handleTimeChange = (index: number, time: string) => {
    const newTimes = [...formData.specificTimes];
    newTimes[index] = time;
    setFormData(prev => ({ ...prev, specificTimes: newTimes }));
  };

  const handleChannelToggle = (channelId: string, enabled: boolean) => {
    const newChannels = enabled
      ? [...formData.deliveryChannels, channelId]
      : formData.deliveryChannels.filter(id => id !== channelId);
    
    // Ensure at least one channel is selected
    if (newChannels.length === 0) {
      setError('حداقل یک کانال ارسال باید انتخاب شود');
      return;
    }
    
    setFormData(prev => ({ ...prev, deliveryChannels: newChannels }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('عنوان یادآوری الزامی است');
      return false;
    }
    
    if (!formData.medicationName.trim()) {
      setError('نام دارو الزامی است');
      return false;
    }
    
    if (!formData.dosage.trim()) {
      setError('دوز دارو الزامی است');
      return false;
    }
    
    if (!formData.startDate) {
      setError('تاریخ شروع الزامی است');
      return false;
    }
    
    if (formData.endDate && formData.endDate <= formData.startDate) {
      setError('تاریخ پایان باید بعد از تاریخ شروع باشد');
      return false;
    }
    
    if (formData.deliveryChannels.length === 0) {
      setError('حداقل یک کانال ارسال باید انتخاب شود');
      return false;
    }
    
    // Check if selected channels are available
    const unavailableChannels = formData.deliveryChannels.filter(channelId => {
      const channel = deliveryChannels.find(c => c.id === channelId);
      return !channel?.available;
    });
    
    if (unavailableChannels.length > 0) {
      setError('برخی از کانال‌های انتخابی در دسترس نیستند');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await onSubmit(formData);
      setSuccess(isEditing ? 'یادآوری با موفقیت به‌روزرسانی شد' : 'یادآوری با موفقیت ایجاد شد');
      
      if (!isEditing) {
        // Reset form for new reminder
        setFormData({
          title: '',
          description: '',
          medicationName: '',
          dosage: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          timesPerDay: 1,
          specificTimes: ['08:00'],
          deliveryChannels: ['push'],
          notificationEnabled: true,
        });
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'خطا در ذخیره یادآوری');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {isEditing ? 'ویرایش یادآوری' : 'ایجاد یادآوری جدید'}
        </CardTitle>
        <CardDescription>
          یادآوری مصرف دارو با قابلیت ارسال از طریق کانال‌های مختلف
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان یادآوری *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="مثال: مصرف قرص فشار خون"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicationName">نام دارو *</Label>
                <Input
                  id="medicationName"
                  value={formData.medicationName}
                  onChange={(e) => handleInputChange('medicationName', e.target.value)}
                  placeholder="مثال: لوزارتان"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dosage">دوز مصرف *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                placeholder="مثال: 1 قرص 50 میلی‌گرم"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات اضافی</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="توضیحات اضافی در مورد نحوه مصرف..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="w-5 h-5" />
              زمان‌بندی
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">تاریخ شروع *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">تاریخ پایان (اختیاری)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timesPerDay">تعداد دفعات در روز</Label>
              <Input
                id="timesPerDay"
                type="number"
                min="1"
                max="6"
                value={formData.timesPerDay}
                onChange={(e) => handleTimesPerDayChange(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>ساعات مصرف</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {formData.specificTimes.map((time, index) => (
                  <Input
                    key={index}
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                  />
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Channels */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Bell className="w-5 h-5" />
              کانال‌های ارسال
            </h3>
            
            <div className="space-y-3">
              {deliveryChannels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {channel.icon}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{channel.name}</span>
                        {!channel.available && (
                          <Badge variant="secondary">غیرفعال</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{channel.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={channel.enabled && channel.available}
                    onCheckedChange={(enabled) => handleChannelToggle(channel.id, enabled)}
                    disabled={!channel.available}
                  />
                </div>
              ))}
            </div>
            
            {formData.deliveryChannels.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  حداقل یک کانال ارسال باید انتخاب شود
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" disabled={isLoading}>
              انصراف
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 ml-2" />
                  {isEditing ? 'به‌روزرسانی' : 'ایجاد یادآوری'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}