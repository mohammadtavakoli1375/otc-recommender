'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Heart, Pill, Clock, Plus, Edit, Trash2, Calendar, Weight, Phone, AlertTriangle } from 'lucide-react';

interface PatientProfile {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  weight_kg: number;
  height_cm?: number;
  phone?: string;
  emergency_contact?: string;
  blood_type?: string;
  allergies?: string;
  medicalHistory: MedicalHistory[];
  medicationHistory: MedicationHistory[];
  reminders: Reminder[];
}

interface MedicalHistory {
  id: string;
  condition_name: string;
  condition_type: string;
  diagnosed_date?: string;
  is_chronic: boolean;
  is_active: boolean;
  notes?: string;
}

interface MedicationHistory {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  prescribed_by?: string;
  notes?: string;
}

interface Reminder {
  id: string;
  title: string;
  medication_name: string;
  dosage: string;
  frequency_type: string;
  times_per_day: number;
  is_active: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<PatientProfile>>({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.patientProfile);
        setEditData(data.patientProfile);
      } else {
        setError('خطا در دریافت اطلاعات پروفایل');
      }
    } catch {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(prev => ({ ...prev!, ...updatedProfile }));
        setEditMode(false);
      } else {
        setError('خطا در ذخیره اطلاعات');
      }
    } catch {
      setError('خطا در اتصال به سرور');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getGenderLabel = (gender: string) => {
    const labels = { MALE: 'مرد', FEMALE: 'زن', OTHER: 'سایر' };
    return labels[gender as keyof typeof labels] || gender;
  };

  const getConditionTypeLabel = (type: string) => {
    const labels = {
      DIABETES: 'دیابت',
      HYPERTENSION: 'فشار خون بالا',
      KIDNEY_DISEASE: 'بیماری کلیوی',
      LIVER_DISEASE: 'بیماری کبدی',
      HEART_DISEASE: 'بیماری قلبی',
      ASTHMA: 'آسم',
      ALLERGY: 'آلرژی',
      PREGNANCY: 'بارداری',
      BREASTFEEDING: 'شیردهی',
      OTHER: 'سایر'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">خطا در بارگذاری پروفایل</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/auth/login')}>ورود مجدد</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-sm text-gray-500">
                  {calculateAge(profile.date_of_birth)} ساله • {getGenderLabel(profile.gender)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button variant="outline" onClick={() => router.push('/')}>
                صفحه اصلی
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                خروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              اطلاعات شخصی
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              سابقه پزشکی
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              داروهای مصرفی
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              یادآوری‌ها
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>اطلاعات شخصی</CardTitle>
                    <CardDescription>مدیریت اطلاعات پایه پروفایل</CardDescription>
                  </div>
                  <Button
                    variant={editMode ? "default" : "outline"}
                    onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                  >
                    {editMode ? 'ذخیره' : 'ویرایش'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* اطلاعات هویتی */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">اطلاعات هویتی</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">نام</Label>
                      {editMode ? (
                        <Input
                          value={editData.first_name || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                          className="text-right"
                          placeholder="نام خود را وارد کنید"
                        />
                      ) : (
                        <div className="text-base text-gray-900 p-3 bg-gray-50 rounded-md border">
                          {profile.first_name || 'وارد نشده'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">نام خانوادگی</Label>
                      {editMode ? (
                        <Input
                          value={editData.last_name || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                          className="text-right"
                          placeholder="نام خانوادگی خود را وارد کنید"
                        />
                      ) : (
                        <div className="text-base text-gray-900 p-3 bg-gray-50 rounded-md border">
                          {profile.last_name || 'وارد نشده'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* اطلاعات جسمانی */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">اطلاعات جسمانی</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Weight className="h-4 w-4 text-blue-600" />
                        وزن
                      </Label>
                      {editMode ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={editData.weight_kg || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) }))}
                            className="text-right pr-16"
                            placeholder="75"
                          />
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                            کیلوگرم
                          </span>
                        </div>
                      ) : (
                        <div className="text-base text-gray-900 p-3 bg-gray-50 rounded-md border">
                          {profile.weight_kg ? `${profile.weight_kg} کیلوگرم` : 'وارد نشده'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">قد</Label>
                      {editMode ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={editData.height_cm || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, height_cm: parseFloat(e.target.value) }))}
                            className="text-right pr-20"
                            placeholder="175"
                          />
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                            سانتی‌متر
                          </span>
                        </div>
                      ) : (
                        <div className="text-base text-gray-900 p-3 bg-gray-50 rounded-md border">
                          {profile.height_cm ? `${profile.height_cm} سانتی‌متر` : 'وارد نشده'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">گروه خونی</Label>
                      {editMode ? (
                        <Input
                          value={editData.blood_type || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, blood_type: e.target.value }))}
                          placeholder="مثال: A+"
                          className="text-right"
                        />
                      ) : (
                        <div className="text-base text-gray-900 p-3 bg-gray-50 rounded-md border">
                          {profile.blood_type || 'وارد نشده'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* اطلاعات تماس */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">اطلاعات تماس</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Phone className="h-4 w-4 text-green-600" />
                        شماره تلفن
                      </Label>
                      {editMode ? (
                        <Input
                          value={editData.phone || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                          className="text-right"
                          placeholder="09123456789"
                        />
                      ) : (
                        <div className="text-base text-gray-900 p-3 bg-gray-50 rounded-md border">
                          {profile.phone || 'وارد نشده'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">مخاطب اضطراری</Label>
                      {editMode ? (
                        <Input
                          value={editData.emergency_contact || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                          className="text-right"
                          placeholder="نام و شماره تماس"
                        />
                      ) : (
                        <div className="text-base text-gray-900 p-3 bg-gray-50 rounded-md border">
                          {profile.emergency_contact || 'وارد نشده'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* اطلاعات پزشکی */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">اطلاعات پزشکی</h3>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">آلرژی‌ها و حساسیت‌ها</Label>
                    {editMode ? (
                      <Textarea
                        value={editData.allergies || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, allergies: e.target.value }))}
                        placeholder="آلرژی‌های شناخته شده را وارد کنید (مثال: پنی‌سیلین، آسپرین، گردو)"
                        className="text-right min-h-[100px]"
                      />
                    ) : (
                      <div className="text-base text-gray-900 p-3 bg-gray-50 rounded-md border min-h-[100px]">
                        {profile.allergies || 'آلرژی خاصی ثبت نشده است'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>سابقه پزشکی</CardTitle>
                    <CardDescription>بیماری‌ها و شرایط پزشکی</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن بیماری
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {profile.medicalHistory.length > 0 ? (
                  <div className="space-y-4">
                    {profile.medicalHistory.map((condition) => (
                      <div key={condition.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{condition.condition_name}</h3>
                              <Badge variant={condition.is_chronic ? "destructive" : "secondary"}>
                                {condition.is_chronic ? 'مزمن' : 'موقت'}
                              </Badge>
                              <Badge variant={condition.is_active ? "default" : "outline"}>
                                {condition.is_active ? 'فعال' : 'غیرفعال'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              نوع: {getConditionTypeLabel(condition.condition_type)}
                            </p>
                            {condition.diagnosed_date && (
                              <p className="text-sm text-gray-600 mb-1">
                                تاریخ تشخیص: {new Date(condition.diagnosed_date).toLocaleDateString('fa-IR')}
                              </p>
                            )}
                            {condition.notes && (
                              <p className="text-sm text-gray-600">{condition.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">هیچ سابقه پزشکی ثبت نشده است</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>داروهای مصرفی</CardTitle>
                    <CardDescription>لیست داروهای فعلی و گذشته</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن دارو
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {profile.medicationHistory.length > 0 ? (
                  <div className="space-y-4">
                    {profile.medicationHistory.map((medication) => (
                      <div key={medication.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{medication.medication_name}</h3>
                              <Badge variant={medication.is_current ? "default" : "outline"}>
                                {medication.is_current ? 'در حال مصرف' : 'متوقف شده'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">دوز: {medication.dosage}</p>
                            <p className="text-sm text-gray-600 mb-1">فرکانس: {medication.frequency}</p>
                            <p className="text-sm text-gray-600 mb-1">
                              شروع: {new Date(medication.start_date).toLocaleDateString('fa-IR')}
                            </p>
                            {medication.end_date && (
                              <p className="text-sm text-gray-600 mb-1">
                                پایان: {new Date(medication.end_date).toLocaleDateString('fa-IR')}
                              </p>
                            )}
                            {medication.prescribed_by && (
                              <p className="text-sm text-gray-600 mb-1">تجویزکننده: {medication.prescribed_by}</p>
                            )}
                            {medication.notes && (
                              <p className="text-sm text-gray-600">{medication.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">هیچ داروی مصرفی ثبت نشده است</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>یادآوری‌های دارویی</CardTitle>
                    <CardDescription>مدیریت یادآوری‌های مصرف دارو</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن یادآوری
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {profile.reminders.length > 0 ? (
                  <div className="space-y-4">
                    {profile.reminders.map((reminder) => (
                      <div key={reminder.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{reminder.title}</h3>
                              <Badge variant={reminder.is_active ? "default" : "outline"}>
                                {reminder.is_active ? 'فعال' : 'غیرفعال'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">دارو: {reminder.medication_name}</p>
                            <p className="text-sm text-gray-600 mb-1">دوز: {reminder.dosage}</p>
                            <p className="text-sm text-gray-600">
                              {reminder.times_per_day} بار در روز • {reminder.frequency_type}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">هیچ یادآوری تنظیم نشده است</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}