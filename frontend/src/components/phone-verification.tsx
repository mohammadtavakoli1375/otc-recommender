'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Shield, CheckCircle } from 'lucide-react';

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
  initialPhoneNumber?: string;
}

interface OtpResponse {
  success: boolean;
  message: string;
  otpId?: string;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  verified?: boolean;
}

export function PhoneVerification({ onVerificationComplete, initialPhoneNumber = '' }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Handle different input formats
    let formatted = digits;
    if (digits.startsWith('0098')) {
      formatted = digits.substring(4);
    } else if (digits.startsWith('98')) {
      formatted = digits.substring(2);
    } else if (digits.startsWith('0')) {
      formatted = digits.substring(1);
    }
    
    // Add formatting
    if (formatted.length >= 10) {
      return `${formatted.substring(0, 3)} ${formatted.substring(3, 6)} ${formatted.substring(6, 10)}`;
    } else if (formatted.length >= 6) {
      return `${formatted.substring(0, 3)} ${formatted.substring(3, 6)} ${formatted.substring(6)}`;
    } else if (formatted.length >= 3) {
      return `${formatted.substring(0, 3)} ${formatted.substring(3)}`;
    }
    
    return formatted;
  };

  // Validate Iranian mobile number
  const isValidIranianMobile = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    const iranMobilePattern = /^9[0-9]{9}$/;
    return iranMobilePattern.test(digits);
  };

  // Send OTP
  const sendOtp = async () => {
    if (!isValidIranianMobile(phoneNumber)) {
      setError('لطفاً شماره موبایل معتبر وارد کنید (مثال: 0912 345 6789)');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ phoneNumber: cleanPhone }),
      });

      const data: OtpResponse = await response.json();

      if (data.success) {
        setOtpId(data.otpId || '');
        setStep('otp');
        setSuccess('کد تأیید به شماره شما ارسال شد');
        startCountdown();
      } else {
        setError(data.message || 'خطا در ارسال کد تأیید');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (otpCode.length !== 5) {
      setError('کد تأیید باید 5 رقم باشد');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ 
          otpId, 
          otpCode,
          phoneNumber: phoneNumber.replace(/\D/g, ''),
        }),
      });

      const data: VerifyResponse = await response.json();

      if (data.success && data.verified) {
        setStep('verified');
        setSuccess('شماره موبایل شما با موفقیت تأیید شد');
        setTimeout(() => {
          onVerificationComplete(phoneNumber.replace(/\D/g, ''));
        }, 1500);
      } else {
        setError(data.message || 'کد تأیید نامعتبر است');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(120); // 2 minutes
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format countdown time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Resend OTP
  const resendOtp = async () => {
    if (countdown > 0) return;
    await sendOtp();
  };

  if (step === 'verified') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">تأیید موفق</CardTitle>
          <CardDescription>
            شماره موبایل شما با موفقیت تأیید شد
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          {step === 'phone' ? (
            <Phone className="w-6 h-6 text-blue-600" />
          ) : (
            <Shield className="w-6 h-6 text-blue-600" />
          )}
        </div>
        <CardTitle>
          {step === 'phone' ? 'تأیید شماره موبایل' : 'وارد کردن کد تأیید'}
        </CardTitle>
        <CardDescription>
          {step === 'phone'
            ? 'برای دریافت یادآوری‌های SMS، شماره موبایل خود را تأیید کنید'
            : `کد تأیید ارسال شده به ${phoneNumber} را وارد کنید`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
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

        {step === 'phone' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">شماره موبایل</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0912 345 6789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                  className="text-left"
                  dir="ltr"
                  maxLength={13}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  +98
                </div>
              </div>
            </div>
            
            <Button 
              onClick={sendOtp} 
              disabled={isLoading || !isValidIranianMobile(phoneNumber)}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                'ارسال کد تأیید'
              )}
            </Button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">کد تأیید</Label>
              <Input
                id="otp"
                type="text"
                placeholder="12345"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 5))}
                className="text-center text-lg tracking-widest"
                maxLength={5}
              />
            </div>
            
            <Button 
              onClick={verifyOtp} 
              disabled={isLoading || otpCode.length !== 5}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال تأیید...
                </>
              ) : (
                'تأیید کد'
              )}
            </Button>
            
            <div className="text-center space-y-2">
              {countdown > 0 ? (
                <p className="text-sm text-gray-500">
                  ارسال مجدد کد تا {formatTime(countdown)}
                </p>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={resendOtp}
                  disabled={isLoading}
                  className="text-sm"
                >
                  ارسال مجدد کد تأیید
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setError('');
                  setSuccess('');
                }}
                className="text-sm"
              >
                تغییر شماره موبایل
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}