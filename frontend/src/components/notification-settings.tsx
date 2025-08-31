'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { pushNotificationManager } from '@/lib/push-notifications';
import { PhoneVerification } from './phone-verification';

interface NotificationPreferences {
  push: boolean;
  sms: boolean;
  email: boolean;
}

interface NotificationSettingsProps {
  userId: string;
  userPhone?: string;
  phoneVerified?: boolean;
}

export function NotificationSettings({ 
  userId, 
  userPhone = '', 
  phoneVerified = false 
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push: true,
    sms: true,
    email: false,
  });
  
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushPermission, setPushPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [currentPhone, setCurrentPhone] = useState(userPhone);
  const [isPhoneVerified, setIsPhoneVerified] = useState(phoneVerified);

  useEffect(() => {
    initializeNotificationSettings();
  }, []);

  const initializeNotificationSettings = async () => {
    try {
      // Check push notification support
      const initialized = await pushNotificationManager.initialize();
      setPushSupported(initialized);
      
      if (initialized) {
        const permissionStatus = pushNotificationManager.getPermissionStatus();
        setPushPermission(permissionStatus.granted ? 'granted' : 
                         permissionStatus.denied ? 'denied' : 'default');
        
        const subscribed = await pushNotificationManager.isSubscribed();
        setPushSubscribed(subscribed);
      }
      
      // Load user preferences
      await loadUserPreferences();
    } catch (error) {
      console.error('Failed to initialize notification settings:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(newPreferences),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPreferences(newPreferences);
        setSuccess('تنظیمات با موفقیت ذخیره شد');
      } else {
        setError(data.message || 'خطا در ذخیره تنظیمات');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && !pushSubscribed) {
      // Subscribe to push notifications
      try {
        setIsLoading(true);
        const subscription = await pushNotificationManager.subscribe();
        
        if (subscription) {
          const success = await pushNotificationManager.sendSubscriptionToServer(subscription);
          if (success) {
            setPushSubscribed(true);
            setPushPermission('granted');
            await updatePreferences({ ...preferences, push: true });
          } else {
            setError('خطا در ثبت اشتراک push notification');
          }
        } else {
          setError('امکان ثبت اشتراک push notification وجود ندارد');
        }
      } catch (error) {
        setError('خطا در فعال‌سازی push notification');
      } finally {
        setIsLoading(false);
      }
    } else if (!enabled && pushSubscribed) {
      // Unsubscribe from push notifications
      try {
        setIsLoading(true);
        const success = await pushNotificationManager.unsubscribe();
        await pushNotificationManager.removeSubscriptionFromServer();
        
        if (success) {
          setPushSubscribed(false);
          await updatePreferences({ ...preferences, push: false });
        } else {
          setError('خطا در لغو اشتراک push notification');
        }
      } catch (error) {
        setError('خطا در غیرفعال‌سازی push notification');
      } finally {
        setIsLoading(false);
      }
    } else {
      await updatePreferences({ ...preferences, push: enabled });
    }
  };

  const handleSmsToggle = async (enabled: boolean) => {
    if (enabled && !isPhoneVerified) {
      setShowPhoneVerification(true);
    } else {
      await updatePreferences({ ...preferences, sms: enabled });
    }
  };

  const handleEmailToggle = async (enabled: boolean) => {
    await updatePreferences({ ...preferences, email: enabled });
  };

  const sendTestPush = async () => {
    try {
      setIsLoading(true);
      const success = await pushNotificationManager.sendTestNotification();
      
      if (success) {
        setSuccess('اعلان تستی ارسال شد');
      } else {
        setError('خطا در ارسال اعلان تستی');
      }
    } catch (error) {
      setError('خطا در ارسال اعلان تستی');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestSms = async () => {
    if (!isPhoneVerified || !currentPhone) {
      setError('ابتدا شماره موبایل خود را تأیید کنید');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications/sms/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ phoneNumber: currentPhone }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('پیامک تستی ارسال شد');
      } else {
        setError(data.error || 'خطا در ارسال پیامک تستی');
      }
    } catch (error) {
      setError('خطا در ارسال پیامک تستی');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerificationComplete = (phoneNumber: string) => {
    setCurrentPhone(phoneNumber);
    setIsPhoneVerified(true);
    setShowPhoneVerification(false);
    updatePreferences({ ...preferences, sms: true });
    setSuccess('شماره موبایل تأیید شد و SMS فعال گردید');
  };

  if (showPhoneVerification) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => setShowPhoneVerification(false)}
          className="mb-4"
        >
          ← بازگشت به تنظیمات
        </Button>
        <PhoneVerification 
          onVerificationComplete={handlePhoneVerificationComplete}
          initialPhoneNumber={currentPhone}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle>تنظیمات اعلانات</CardTitle>
          </div>
          <CardDescription>
            نحوه دریافت یادآوری‌های دارویی و اعلانات سیستم را تنظیم کنید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <Label className="text-base font-medium">اعلانات مرورگر</Label>
                  <p className="text-sm text-gray-500">
                    دریافت اعلانات در مرورگر حین استفاده از سایت
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pushSupported ? (
                  <Badge variant={pushSubscribed ? "default" : "secondary"}>
                    {pushSubscribed ? 'فعال' : 'غیرفعال'}
                  </Badge>
                ) : (
                  <Badge variant="destructive">پشتیبانی نمی‌شود</Badge>
                )}
                <Switch
                  checked={preferences.push && pushSubscribed}
                  onCheckedChange={handlePushToggle}
                  disabled={!pushSupported || isLoading}
                />
              </div>
            </div>
            
            {pushSupported && pushSubscribed && (
              <div className="ml-8 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={sendTestPush}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Bell className="w-4 h-4 ml-2" />
                  )}
                  ارسال اعلان تستی
                </Button>
              </div>
            )}
            
            {pushPermission === 'denied' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  اجازه اعلانات مرورگر رد شده است. برای فعال‌سازی، از تنظیمات مرورگر اجازه دهید.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* SMS Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <Label className="text-base font-medium">پیامک (SMS)</Label>
                  <p className="text-sm text-gray-500">
                    دریافت یادآوری‌ها از طریق پیامک
                  </p>
                  {currentPhone && (
                    <p className="text-xs text-gray-400 mt-1">
                      شماره: {currentPhone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPhoneVerified ? (
                  <Badge variant="default">تأیید شده</Badge>
                ) : (
                  <Badge variant="secondary">تأیید نشده</Badge>
                )}
                <Switch
                  checked={preferences.sms && isPhoneVerified}
                  onCheckedChange={handleSmsToggle}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {!isPhoneVerified && (
              <div className="ml-8 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowPhoneVerification(true)}
                >
                  <Smartphone className="w-4 h-4 ml-2" />
                  تأیید شماره موبایل
                </Button>
              </div>
            )}
            
            {isPhoneVerified && preferences.sms && (
              <div className="ml-8 pt-2 space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={sendTestSms}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <MessageSquare className="w-4 h-4 ml-2" />
                  )}
                  ارسال پیامک تستی
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPhoneVerification(true)}
                >
                  تغییر شماره
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <Label className="text-base font-medium">ایمیل</Label>
                  <p className="text-sm text-gray-500">
                    دریافت خلاصه‌ای از یادآوری‌ها و اطلاعات مهم
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">به‌زودی</Badge>
                <Switch
                  checked={preferences.email}
                  onCheckedChange={handleEmailToggle}
                  disabled={true}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">خلاصه تنظیمات</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>اعلانات مرورگر:</span>
                <span className={preferences.push && pushSubscribed ? 'text-green-600' : 'text-gray-500'}>
                  {preferences.push && pushSubscribed ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>پیامک:</span>
                <span className={preferences.sms && isPhoneVerified ? 'text-green-600' : 'text-gray-500'}>
                  {preferences.sms && isPhoneVerified ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ایمیل:</span>
                <span className="text-gray-500">غیرفعال</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}