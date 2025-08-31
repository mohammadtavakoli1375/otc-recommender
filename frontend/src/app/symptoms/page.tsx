'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Heart, User, Pill, Stethoscope, Clock, AlertTriangle, CheckCircle, Loader2, ChevronDown, Filter, Info } from 'lucide-react';
import Link from 'next/link';

interface PatientData {
  age: number;
  sex: 'M' | 'F';
  pregnantWeeks?: number;
  isBreastfeeding?: boolean;
  isElder: boolean;
  meds: string[];
}

interface SymptomData {
  symptoms: string[];
  durationDays: number;
  redFlags: Record<string, boolean>;
  details?: {
    duration?: string;
    severity?: string;
    notes?: string;
  };
}

interface TriageResult {
  action: string;
  blocks: Array<{ ingredient: string; dose: string; maxDays: number; why: string; reason?: string }>;
  avoid?: Array<{ ingredient: string; reason: string }>;
  suggestions: Array<{
    ingredient: string;
    dose: string;
    maxDays: number;
    why: string;
    education?: string[];
    complementarySupplements?: {
      primary: string[];
      rationale: string;
      evidence: string;
    };
  }>;
  education?: string[];
}

const symptoms = [
  // علائم عمومی
  { id: 'fever', name_fa: 'تب', name_en: 'Fever', category: 'عمومی' },
  { id: 'headache', name_fa: 'سردرد', name_en: 'Headache', category: 'عمومی' },
  { id: 'fatigue', name_fa: 'خستگی', name_en: 'Fatigue', category: 'عمومی' },
  { id: 'muscle_aches', name_fa: 'درد عضلانی', name_en: 'Muscle Aches', category: 'عمومی' },
  { id: 'joint_pain', name_fa: 'درد مفاصل', name_en: 'Joint Pain', category: 'عمومی' },
  { id: 'chills', name_fa: 'لرز', name_en: 'Chills', category: 'عمومی' },
  
  // علائم تنفسی
  { id: 'sore_throat', name_fa: 'گلودرد', name_en: 'Sore Throat', category: 'تنفسی' },
  { id: 'cough_dry', name_fa: 'سرفه خشک', name_en: 'Dry Cough', category: 'تنفسی' },
  { id: 'cough_productive', name_fa: 'سرفه خلط‌دار', name_en: 'Productive Cough', category: 'تنفسی' },
  { id: 'nasal_congestion', name_fa: 'گرفتگی بینی', name_en: 'Nasal Congestion', category: 'تنفسی' },
  { id: 'runny_nose', name_fa: 'آبریزش بینی', name_en: 'Runny Nose', category: 'تنفسی' },
  { id: 'sneezing', name_fa: 'عطسه', name_en: 'Sneezing', category: 'تنفسی' },
  { id: 'post_nasal_drip', name_fa: 'چکیدن مخاط از پشت بینی', name_en: 'Post Nasal Drip', category: 'تنفسی' },
  { id: 'hoarseness', name_fa: 'خشونت صدا', name_en: 'Hoarseness', category: 'تنفسی' },
  
  // علائم گوارشی
  { id: 'nausea', name_fa: 'حالت تهوع', name_en: 'Nausea', category: 'گوارشی' },
  { id: 'vomiting', name_fa: 'استفراغ', name_en: 'Vomiting', category: 'گوارشی' },
  { id: 'stomach_pain', name_fa: 'درد شکم', name_en: 'Stomach Pain', category: 'گوارشی' },
  { id: 'diarrhea', name_fa: 'اسهال', name_en: 'Diarrhea', category: 'گوارشی' },
  { id: 'constipation', name_fa: 'یبوست', name_en: 'Constipation', category: 'گوارشی' },
  { id: 'heartburn', name_fa: 'سوزش سر دل', name_en: 'Heartburn', category: 'گوارشی' },
  { id: 'bloating', name_fa: 'نفخ شکم', name_en: 'Bloating', category: 'گوارشی' },
  { id: 'loss_of_appetite', name_fa: 'کاهش اشتها', name_en: 'Loss of Appetite', category: 'گوارشی' },
  
  // علائم آلرژیک
  { id: 'itchy_eyes', name_fa: 'خارش چشم', name_en: 'Itchy Eyes', category: 'آلرژیک' },
  { id: 'watery_eyes', name_fa: 'اشک‌ریزش', name_en: 'Watery Eyes', category: 'آلرژیک' },
  { id: 'skin_rash', name_fa: 'بثورات پوستی', name_en: 'Skin Rash', category: 'آلرژیک' },
  { id: 'itchy_skin', name_fa: 'خارش پوست', name_en: 'Itchy Skin', category: 'آلرژیک' },
  { id: 'hives', name_fa: 'کهیر', name_en: 'Hives', category: 'آلرژیک' },
  
  // علائم درد
  { id: 'back_pain', name_fa: 'کمردرد', name_en: 'Back Pain', category: 'درد' },
  { id: 'neck_pain', name_fa: 'گردن درد', name_en: 'Neck Pain', category: 'درد' },
  { id: 'toothache', name_fa: 'دندان درد', name_en: 'Toothache', category: 'درد' },
  { id: 'earache', name_fa: 'گوش درد', name_en: 'Earache', category: 'درد' },
  { id: 'menstrual_cramps', name_fa: 'درد قاعدگی', name_en: 'Menstrual Cramps', category: 'درد' },
  
  // علائم خواب و روانی
  { id: 'insomnia', name_fa: 'بی‌خوابی', name_en: 'Insomnia', category: 'خواب' },
  { id: 'drowsiness', name_fa: 'خواب‌آلودگی', name_en: 'Drowsiness', category: 'خواب' },
  { id: 'anxiety', name_fa: 'اضطراب', name_en: 'Anxiety', category: 'روانی' },
  { id: 'irritability', name_fa: 'تحریک‌پذیری', name_en: 'Irritability', category: 'روانی' },
  
  // علائم پوستی
  { id: 'dry_skin', name_fa: 'خشکی پوست', name_en: 'Dry Skin', category: 'پوستی' },
  { id: 'minor_cuts', name_fa: 'بریدگی‌های جزئی', name_en: 'Minor Cuts', category: 'پوستی' },
  { id: 'bruises', name_fa: 'کبودی', name_en: 'Bruises', category: 'پوستی' },
  { id: 'sunburn', name_fa: 'آفتاب‌سوختگی', name_en: 'Sunburn', category: 'پوستی' }
];

const commonMedications = [
  // داروهای OTC موجود در سیستم
  'استامینوفن',
  'ایبوپروفن',
  'آسپرین',
  'دیفن‌هیدرامین',
  'لوراتادین',
  'سیتریزین',
  'امپرازول',
  'فامتیدین',
  'لوپرامید',
  'سیمتیکون',
  'بیسموت ساب‌سالیسیلات',
  'اسپری/قطره نمکی بینی',
  'لیکوفار',
  'التادین',
  'آبنبات‌های سرماخوردگی',

  'کالامین لوشن',
  'مولتی ویتامین مینرال',
  'شربت دکسترومتورفان',
  'شربت دیفن هیدرامین',
  'شربت تیمکس (Thymex)',
  'شربت توسیان (Tussian)',
  'شربت برونکو باریج (Broncho Barij)',
  'زوفا عسلی رازک',
  'کالیک نوتک‌فار',
  'روتارین قائم‌دارو',
  'پلارژین بزرگسالان',
  'شربت گایافنزین (Guaifenesin)',
  'شربت برم‌هگزین (Bromhexine)',
  'شربت استیل‌سیستئین (N-Acetylcysteine)',
  'شربت زوفا عسلی (Razak) - خلط‌آور',
  'شربت برونکو باریج خلط‌آور (Broncho Barij Expectorant)',
  'دیمن‌هیدرینات (Dimenhydrinate)',
  'متوکلوپرامید (Metoclopramide)',
  'دمپریدون (Domperidone)',
  'اندانسترون (Ondansetron)',
  'محلول ORS (Oral Rehydration Solution)',
  'شربت لاکتولوز (Lactulose)',
  'پسیلیوم (Psyllium/اسپرزه)',
  'پلی‌اتیلن گلیکول (PEG 3350)',
  'بیزاکودیل (Bisacodyl)',
  'شیاف گلیسیرین (Glycerin Suppository)',
  'شربت‌های گیاهی (انجیر، گل‌سرخ، ترنجبین)',
  'سنا (Senna)',
  'ساشه روتارین (Rotarin)',
  'سیپروهپتادین (Cyproheptadine)',
  'شربت زینک پلاس (Zinc Plus Syrup)',
  'ویتامین B کمپلکس (Vitamin B Complex)',
  'شربت شیکوریدین (Chicoridin Syrup)',
  'نوافن',
  'سلکسیب (Celecoxib)',
  'ملوکسیکام 7.5mg (Meloxicam)',
  'ژل دیکلوفناک (Diclofenac Gel)',
  'ژل پیروکسیکام (Piroxicam Gel)',
  'پماد کپسایسین (Capsaicin Ointment)',
  'پماد سالیسیلات متیل (Methyl Salicylate)',
  'نوافن (Nafen)',

  'ملاتونین (Melatonin)',
  'دیفن‌هیدرامین شب (Diphenhydramine PM)',
  'کرم اوره 10% (Urea Cream)',
  'کرم آنتی‌بیوتیک سه‌گانه (Triple Antibiotic)',
  'منیزیم + ویتامین B6 (Magnesium-B6)',
  'والرین (Valerian Root / سنبل‌الطیب)',
  'پاسید (Passid Drops)',
  'بادرنجبویه (Melissa officinalis / Lemon Balm)',
  'گل ساعتی (Passiflora incarnata)',
  'بابونه (Chamomile)',
  'پماد زینک اکساید (Zinc Oxide Ointment)',
  'ژل آرنیکا (Arnica Gel/Cream)',
  'کرم ریکنوال K1 (Reconval K1 Topical Cream)',
  'ژل آلوئه‌ورا (Aloe Vera Gel)',
  'کرم پانثنول (D-Panthenol / Bepanthol)',
  'کرم سیکالفیت (Cicalfate / Cicamed)',
  
  // داروهای تجویزی با تداخل دارویی مهم
  'وارفارین',
  'کلوپیدوگرل',
  'انالاپریل (ACEI)',
  'لوزارتان (ARB)',
  'هیدروکلروتیازید (دیورتیک)',
  'فوروزماید (دیورتیک)',
  'متوترکسات',
  'کتوکونازول',
  'اریترومایسین',
  'آتازاناویر',
  'ریتونویر',
  'دیگوکسین',
  'لیتیوم',
  'فنی‌توئین',
  'کاربامازپین',
  'والپروات',
  'سیکلوسپورین',
  'تاکرولیموس',
  'پردنیزولون',

  'انسولین',
  'متفورمین',
  'گلی‌بنکلامید',
  'آتورواستاتین',
  'سیمواستاتین',
  'آمیودارون',
  'دیلتیازم',
  'ورپامیل',
  'بتابلوکرها (پروپرانولول)',
  'تئوفیلین',
  'آلوپورینول',
  'کولشیسین'
];

export default function SymptomsPage() {
  const [patientData, setPatientData] = useState<PatientData>({
    age: 0,
    sex: 'M',
    pregnantWeeks: 0,
    isElder: false,
    meds: [],
  });
  
  const [symptomData, setSymptomData] = useState<SymptomData>({
    symptoms: [],
    durationDays: 1,
    redFlags: {},
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async () => {
    if (patientData.age === 0 || symptomData.symptoms.length === 0) {
      setError('لطفاً تمام فیلدهای ضروری را تکمیل کنید.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const triageData = {
        patient: {
          ...patientData,
          isElder: patientData.age >= 65
        },
        symptoms: symptomData.symptoms,
        durationDays: symptomData.durationDays,
        redFlags: symptomData.redFlags
      };

      const response = await fetch('http://localhost:3001/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(triageData),
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت پاسخ از سرور');
      }

      const data = await response.json();
      setResult(data);
      setShowResults(true);
    } catch {
      setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const symptomCategories = symptoms.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, typeof symptoms>);

  const canSubmit = patientData.age > 0 && symptomData.symptoms.length > 0;

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  اطلاعات شخصی
                </CardTitle>
                <CardDescription>
                  لطفاً اطلاعات پایه خود را وارد کنید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">سن</Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      max="120"
                      value={patientData.age || ''}
                      onChange={(e) => setPatientData({ ...patientData, age: parseInt(e.target.value) || 0 })}
                      placeholder="سن خود را وارد کنید"
                    />
                  </div>
                  
                  <div>
                    <Label>جنسیت</Label>
                    <RadioGroup
                      value={patientData.sex}
                      onValueChange={(value: 'M' | 'F') => setPatientData({ ...patientData, sex: value })}
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="M" id="male" />
                        <Label htmlFor="male">مرد</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="F" id="female" />
                        <Label htmlFor="female">زن</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {patientData.sex === 'F' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pregnancy">هفته بارداری (در صورت بارداری)</Label>
                      <Input
                        id="pregnancy"
                        type="number"
                        min="0"
                        max="42"
                        value={patientData.pregnantWeeks || ''}
                        onChange={(e) => setPatientData({ ...patientData, pregnantWeeks: parseInt(e.target.value) || 0 })}
                        placeholder="0 (در صورت عدم بارداری)"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="breastfeeding"
                        checked={patientData.isBreastfeeding || false}
                        onCheckedChange={(checked) => 
                          setPatientData({ ...patientData, isBreastfeeding: checked as boolean })
                        }
                      />
                      <Label htmlFor="breastfeeding" className="text-sm font-medium">
                        در حال شیردهی هستم
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  داروهای مصرفی
                </CardTitle>
                <CardDescription>
                  داروهایی که در حال حاضر مصرف می‌کنید را انتخاب کنید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* نمایش تعداد داروهای انتخاب شده */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="px-2 py-1">
                        {patientData.meds.length} دارو انتخاب شده
                      </Badge>
                      {patientData.meds.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPatientData({...patientData, meds: []})}
                          className="h-8 text-xs text-red-500 hover:text-red-700"
                        >
                          پاک کردن همه
                        </Button>
                      )}
                    
                    {result && result.avoid && result.avoid.length > 0 && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription>
                          <strong className="text-orange-800">داروهای نیازمند احتیاط:</strong>
                          <ul className="mt-2 space-y-1">
                            {result.avoid.map((avoid, index) => {
                              const isBreastfeedingRelated = avoid.reason.includes('شیردهی');
                              return (
                                <li key={index} className={`text-sm p-2 rounded ${isBreastfeedingRelated ? 'bg-orange-100 border-l-4 border-orange-400' : 'bg-yellow-50'}`}>
                                  <span className="font-medium text-orange-700">{avoid.ingredient}:</span> 
                                  <span className={isBreastfeedingRelated ? 'text-orange-800 font-medium' : 'text-orange-600'}>
                                    {avoid.reason}
                                  </span>
                                  {isBreastfeedingRelated && (
                                    <div className="text-xs text-orange-600 mt-1">
                                      💡 توصیه: قبل از مصرف با پزشک یا داروساز مشورت کنید
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                     

                    </div>
                  </div>
                  
                  {/* منوی کشویی داروهای رایج */}
                  <Collapsible className="w-full border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">داروهای رایج</span>
                        {patientData.meds.filter(med => commonMedications.includes(med)).length > 0 && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            {patientData.meds.filter(med => commonMedications.includes(med)).length}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-2 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {commonMedications.map((med) => (
                          <div 
                            key={med} 
                            className={`flex items-center space-x-2 space-x-reverse p-2 rounded-lg transition-colors ${patientData.meds.includes(med) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'}`}
                          >
                            <Checkbox
                              id={med}
                              checked={patientData.meds.includes(med)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setPatientData({ ...patientData, meds: [...patientData.meds, med] });
                                } else {
                                  setPatientData({ ...patientData, meds: patientData.meds.filter(m => m !== med) });
                                }
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <Label htmlFor={med} className="text-sm cursor-pointer w-full">{med}</Label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <div className="mt-4">
                    <Label htmlFor="other-meds">سایر داروها (اختیاری)</Label>
                    <Input
                      id="other-meds"
                      placeholder="نام داروهای دیگر را با کامه جدا کنید"
                      onChange={(e) => {
                        const otherMeds = e.target.value.split(',').map(m => m.trim()).filter(m => m);
                        const allMeds = [...patientData.meds.filter(m => commonMedications.includes(m)), ...otherMeds];
                        setPatientData({ ...patientData, meds: allMeds });
                      }}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Symptoms Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  انتخاب علائم
                </CardTitle>
                <CardDescription>
                  علائمی که در حال حاضر دارید را انتخاب کنید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* نمایش تعداد علائم انتخاب شده */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="px-2 py-1">
                        {symptomData.symptoms.length} علامت انتخاب شده
                      </Badge>
                      {symptomData.symptoms.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSymptomData({...symptomData, symptoms: []})}
                          className="h-8 text-xs text-red-500 hover:text-red-700"
                        >
                          پاک کردن همه
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      دسته‌بندی‌ها
                    </div>
                  </div>
                  
                  {/* منوی کشویی دسته‌بندی علائم */}
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(symptomCategories).map(([category, categorySymptoms]) => {
                      // محاسبه تعداد علائم انتخاب شده در هر دسته
                      const selectedCount = categorySymptoms.filter(symptom => 
                        symptomData.symptoms.includes(symptom.id)
                      ).length;
                      
                      return (
                        <AccordionItem key={category} value={category} className="border rounded-lg mb-2 overflow-hidden">
                          <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 group">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">علائم {category}</span>
                                {selectedCount > 0 && (
                                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                    {selectedCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3 pt-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {categorySymptoms.map((symptom) => (
                                <div 
                                  key={symptom.id} 
                                  className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg transition-colors ${symptomData.symptoms.includes(symptom.id) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'}`}
                                >
                                  <Checkbox
                                    id={symptom.id}
                                    checked={symptomData.symptoms.includes(symptom.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSymptomData({ ...symptomData, symptoms: [...symptomData.symptoms, symptom.id] });
                                      } else {
                                        setSymptomData({ ...symptomData, symptoms: symptomData.symptoms.filter(s => s !== symptom.id) });
                                      }
                                    }}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                  />
                                  <Label htmlFor={symptom.id} className="text-right cursor-pointer w-full">
                                    <div className="font-medium">{symptom.name_fa}</div>
                                    <div className="text-sm text-gray-500">{symptom.name_en}</div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  جزئیات علائم
                </CardTitle>
                <CardDescription>
                  اطلاعات تکمیلی درباره علائم خود ارائه دهید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Collapsible className="w-full border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-50/50 text-right">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-600" />
                        <span className="font-semibold">مدت زمان علائم</span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-2 border-t bg-slate-50/30">
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-sm font-medium">تعداد روز</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          max="30"
                          value={symptomData.durationDays}
                          onChange={(e) => setSymptomData({ ...symptomData, durationDays: parseInt(e.target.value) || 1 })}
                          className="bg-white"
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div>
                  <Collapsible className="w-full border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-50/50 text-right">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-slate-600" />
                        <span className="font-semibold">جزئیات اضافی</span>
                        {(symptomData.details?.duration || symptomData.details?.severity || symptomData.details?.notes) && (
                          <Badge variant="outline" className="bg-slate-100">
                            تکمیل شده
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-2 border-t bg-slate-50/30">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="symptomDuration" className="text-sm font-medium">مدت زمان علائم</Label>
                            <Select 
                              value={symptomData.details?.duration || ""}
                              onValueChange={(value) => 
                                setSymptomData({
                                  ...symptomData,
                                  details: { ...symptomData.details, duration: value }
                                })
                              }
                            >
                              <SelectTrigger id="symptomDuration" className="bg-white">
                                <SelectValue placeholder="انتخاب کنید" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lessThan24Hours">کمتر از 24 ساعت</SelectItem>
                                <SelectItem value="1to3Days">1 تا 3 روز</SelectItem>
                                <SelectItem value="3to7Days">3 تا 7 روز</SelectItem>
                                <SelectItem value="1to2Weeks">1 تا 2 هفته</SelectItem>
                                <SelectItem value="2to4Weeks">2 تا 4 هفته</SelectItem>
                                <SelectItem value="moreThan4Weeks">بیش از 4 هفته</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="severity" className="text-sm font-medium">شدت علائم</Label>
                            <Select 
                              value={symptomData.details?.severity || ""}
                              onValueChange={(value) => 
                                setSymptomData({
                                  ...symptomData,
                                  details: { ...symptomData.details, severity: value }
                                })
                              }
                            >
                              <SelectTrigger id="severity" className="bg-white">
                                <SelectValue placeholder="انتخاب کنید" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mild">خفیف</SelectItem>
                                <SelectItem value="moderate">متوسط</SelectItem>
                                <SelectItem value="severe">شدید</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-sm font-medium">توضیحات اضافی</Label>
                          <Textarea 
                            id="notes" 
                            placeholder="هرگونه اطلاعات اضافی در مورد علائم را وارد کنید"
                            value={symptomData.details?.notes || ""}
                            onChange={(e) => 
                              setSymptomData({
                                ...symptomData,
                                details: { ...symptomData.details, notes: e.target.value }
                              })
                            }
                            className="min-h-[100px] bg-white"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div>
                  <Collapsible className="w-full border rounded-lg overflow-hidden border-red-200">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-red-50/50 text-right">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-semibold text-red-600">علائم هشدار (Red Flags)</span>
                        {Object.values(symptomData.redFlags).filter(Boolean).length > 0 && (
                          <Badge variant="destructive">
                            {Object.values(symptomData.redFlags).filter(Boolean).length}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-red-600" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-2 border-t border-red-200 bg-red-50/30">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-red-100/50 transition-colors">
                          <Checkbox
                            id="airway"
                            checked={symptomData.redFlags.airway || false}
                            onCheckedChange={(checked) => 
                              setSymptomData({ 
                                ...symptomData, 
                                redFlags: { ...symptomData.redFlags, airway: checked as boolean }
                              })
                            }
                            className="border-red-400 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                          />
                          <Label htmlFor="airway" className="text-red-600 cursor-pointer w-full">مشکل تنفسی یا انسداد راه هوایی</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-red-100/50 transition-colors">
                          <Checkbox
                            id="bloodyDiarrhea"
                            checked={symptomData.redFlags.bloodyDiarrhea || false}
                            onCheckedChange={(checked) => 
                              setSymptomData({ 
                                ...symptomData, 
                                redFlags: { ...symptomData.redFlags, bloodyDiarrhea: checked as boolean }
                              })
                            }
                            className="border-red-400 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                          />
                          <Label htmlFor="bloodyDiarrhea" className="text-red-600 cursor-pointer w-full">اسهال خونی</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-red-100/50 transition-colors">
                          <Checkbox
                            id="suddenSevereHeadache"
                            checked={symptomData.redFlags.suddenSevereHeadache || false}
                            onCheckedChange={(checked) => 
                              setSymptomData({ 
                                ...symptomData, 
                                redFlags: { ...symptomData.redFlags, suddenSevereHeadache: checked as boolean }
                              })
                            }
                            className="border-red-400 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                          />
                          <Label htmlFor="suddenSevereHeadache" className="text-red-600 cursor-pointer w-full">سردرد شدید ناگهانی</Label>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Results */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Summary */}
            <Card className="lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle>خلاصه اطلاعات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">سن و جنسیت:</Label>
                  <p className="text-sm">
                    {patientData.age > 0 ? `${patientData.age} سال` : 'وارد نشده'} - 
                    {patientData.sex === 'M' ? 'مرد' : 'زن'}
                  </p>
                </div>
                
                {patientData.sex === 'F' && (
                  <>
                    {patientData.pregnantWeeks && patientData.pregnantWeeks > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">بارداری:</Label>
                        <p className="text-sm">{patientData.pregnantWeeks} هفته</p>
                      </div>
                    )}
                    
                    {patientData.isBreastfeeding && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">وضعیت:</Label>
                        <p className="text-sm text-orange-600 font-medium">در حال شیردهی</p>
                      </div>
                    )}
                  </>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">داروهای مصرفی:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patientData.meds.length > 0 ? (
                      patientData.meds.map((med, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{med}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">هیچ دارویی</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">علائم انتخاب شده:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {symptomData.symptoms.length > 0 ? (
                      symptomData.symptoms.map((symptomId) => {
                        const symptom = symptoms.find(s => s.id === symptomId);
                        return symptom ? (
                          <Badge key={symptomId} variant="outline" className="text-xs">
                            {symptom.name_fa}
                          </Badge>
                        ) : null;
                      })
                    ) : (
                      <p className="text-sm text-gray-500">هیچ علامتی انتخاب نشده</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">مدت علائم:</Label>
                  <p className="text-sm">{symptomData.durationDays} روز</p>
                </div>
                
                <Separator />
                
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={handleSubmit} 
                  disabled={!canSubmit || isLoading}
                  className="w-full h-12 text-base font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      در حال بررسی...
                    </>
                  ) : (
                    'دریافت پیشنهادات دارویی'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Dialog */}
            <Dialog open={showResults} onOpenChange={setShowResults}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                     <CheckCircle className="h-5 w-5 text-green-600" />
                     نتایج بررسی
                   </DialogTitle>
                   <DialogDescription>
                     نتایج ارزیابی علائم شما و پیشنهادات دارویی
                   </DialogDescription>
                </DialogHeader>
                
                {result && (
                  <div className="space-y-4">
                    {result.action === 'REFER' && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          لطفاً فوراً به پزشک مراجعه کنید. علائم شما نیاز به بررسی تخصصی دارد.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {result.blocks && result.blocks.length > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>داروهای ممنوع:</strong>
                          <ul className="mt-2 space-y-1">
                            {result.blocks.map((block, index) => {
                              const isPregnancyRelated = block.reason?.includes('بارداری') || block.reason?.includes('شیردهی');
                              return (
                                <li key={index} className={`text-sm p-2 rounded ${isPregnancyRelated ? 'bg-red-100 border-l-4 border-red-500' : ''}`}>
                                  <span className="font-medium text-red-700">{block.ingredient}:</span> 
                                  <span className={isPregnancyRelated ? 'text-red-800 font-medium' : 'text-red-600'}>
                                    {block.reason}
                                  </span>
                                  {isPregnancyRelated && (
                                    <div className="text-xs text-red-600 mt-1">
                                      ⚠️ هشدار ویژه: این دارو در دوران بارداری یا شیردهی ممنوع است
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {result.suggestions && result.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">داروهای پیشنهادی:</h4>
                        <div className="space-y-3">
                          {result.suggestions.map((suggestion, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-blue-50/50">
                              <h5 className="font-medium text-blue-600 text-lg">{suggestion.ingredient}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                <p className="text-sm text-gray-600">
                                  <strong>دوز:</strong> {suggestion.dose}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>حداکثر مدت:</strong> {suggestion.maxDays} روز
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>دلیل:</strong> {suggestion.why}
                              </p>
                              {suggestion.education && suggestion.education.length > 0 && (
                                <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                                  <p className="text-sm font-medium text-gray-700 mb-2">نکات مهم:</p>
                                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                                    {suggestion.education.map((tip, tipIndex) => (
                                      <li key={tipIndex}>{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {suggestion.complementarySupplements && (
                                <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                                  <p className="text-sm font-medium text-green-800 mb-2">💊 مکمل‌های توصیه شده:</p>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs font-medium text-green-700 mb-1">مکمل‌های اصلی:</p>
                                      <ul className="text-xs text-green-600 list-disc list-inside space-y-1">
                                        {suggestion.complementarySupplements.primary.map((supplement, suppIndex) => (
                                          <li key={suppIndex}>{supplement}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-green-700">دلیل علمی:</p>
                                      <p className="text-xs text-green-600">{suggestion.complementarySupplements.rationale}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-green-700">شواهد علمی:</p>
                                      <p className="text-xs text-green-600 italic">{suggestion.complementarySupplements.evidence}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {result.education && result.education.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold mb-3 text-green-800">نکات آموزشی:</h4>
                        <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
                          {result.education.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Mobile Floating Action Button */}
        <div className="block lg:hidden fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit || isLoading}
            className="w-16 h-16 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 border-0 p-0 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Stethoscope className="h-6 w-6 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}