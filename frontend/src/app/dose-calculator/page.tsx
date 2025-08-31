'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DrugSearch } from '@/components/ui/drug-search';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calculator, AlertTriangle, CheckCircle, Clock, User, Weight, Calendar } from 'lucide-react';

interface Drug {
  id: string;
  name_fa: string;
  name_en: string;
  generic_name: string;
  min_age_months?: number;
  max_age_years?: number;
}

interface DoseResult {
  calculatedDoseMg: number;
  dosesPerDay: number;
  totalDailyDoseMg: number;
  ageGroup: 'INFANT' | 'CHILD' | 'ADULT';
  isSafe: boolean;
  safetyWarnings: string[];
  calculationNotes: string;
  drug: {
    id: string;
    nameFa: string;
    nameEn: string;
    genericName: string;
  };
}

const ageGroupLabels = {
  INFANT: 'خردسال (0-2 سال)',
  CHILD: 'کودک (2-12 سال)',
  ADULT: 'بزرگسال (12+ سال)'
};

export default function DoseCalculatorPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<string>('');
  const [ageYears, setAgeYears] = useState<string>('');
  const [ageMonths, setAgeMonths] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [result, setResult] = useState<DoseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      const response = await fetch('/api/dose-calculator/drugs');
      if (response.ok) {
        const data = await response.json();
        setDrugs(data);
      }
    } catch (err) {
      console.error('Error fetching drugs:', err);
    }
  };

  const calculateDose = async () => {
    if (!selectedDrug || !ageYears || !weight) {
      setError('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/dose-calculator/calculate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          drugId: selectedDrug,
          ageYears: parseFloat(ageYears),
          ageMonths: parseInt(ageMonths) || 0,
          weightKg: parseFloat(weight),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'خطا در محاسبه دوز');
      }
    } catch {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDrug('');
    setAgeYears('');
    setAgeMonths('');
    setWeight('');
    setResult(null);
    setError('');
  };

  const printResult = () => {
    if (result) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>نتیجه محاسبه دوز دارو</title>
              <style>
                body { font-family: 'Tahoma', sans-serif; direction: rtl; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .result-box { border: 2px solid #333; padding: 20px; margin: 20px 0; }
                .warning { color: red; font-weight: bold; }
                .safe { color: green; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>نتیجه محاسبه دوز دارو</h1>
                <p>تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
              </div>
              <div class="result-box">
                <h2>اطلاعات دارو</h2>
                <p><strong>نام دارو:</strong> ${result.drug.nameFa} (${result.drug.nameEn})</p>
                <p><strong>نام علمی:</strong> ${result.drug.genericName}</p>
              </div>
              <div class="result-box">
                <h2>اطلاعات بیمار</h2>
                <p><strong>سن:</strong> ${ageYears} سال و ${ageMonths} ماه</p>
                <p><strong>وزن:</strong> ${weight} کیلوگرم</p>
                <p><strong>گروه سنی:</strong> ${ageGroupLabels[result.ageGroup]}</p>
              </div>
              <div class="result-box">
                <h2>نتیجه محاسبه</h2>
                <p><strong>دوز هر بار:</strong> ${result.calculatedDoseMg} میلی‌گرم</p>
                <p><strong>تعداد دفعات در روز:</strong> ${result.dosesPerDay} بار</p>
                <p><strong>دوز کل روزانه:</strong> ${result.totalDailyDoseMg} میلی‌گرم</p>
                <p class="${result.isSafe ? 'safe' : 'warning'}">
                  <strong>وضعیت ایمنی:</strong> ${result.isSafe ? 'ایمن' : 'نیاز به احتیاط'}
                </p>
              </div>
              ${result.safetyWarnings.length > 0 ? `
                <div class="result-box">
                  <h2 class="warning">هشدارهای ایمنی</h2>
                  <ul>
                    ${result.safetyWarnings.map(warning => `<li>${warning}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              <div class="result-box">
                <h2>توضیحات محاسبه</h2>
                <p>${result.calculationNotes}</p>
              </div>
              <div style="margin-top: 30px; font-size: 12px; color: #666;">
                <p>این محاسبه صرفاً جهت راهنمایی است و جایگزین مشاوره پزشکی نمی‌باشد.</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Calculator className="h-8 w-8 text-blue-600" />
          محاسبه‌گر دوز دارو
        </h1>
        <p className="text-gray-600">
          محاسبه دقیق دوز داروها بر اساس سن و وزن بیمار
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              اطلاعات بیمار و دارو
            </CardTitle>
            <CardDescription>
              لطفاً اطلاعات مورد نیاز را با دقت وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drug Selection with Search */}
            <DrugSearch
              drugs={drugs}
              selectedDrug={selectedDrug}
              onDrugSelect={setSelectedDrug}
              placeholder="نام دارو را تایپ کنید یا از لیست انتخاب کنید"
              label="انتخاب دارو"
            />

            {/* Age Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageYears" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  سن (سال)
                </Label>
                <Input
                  id="ageYears"
                  type="number"
                  min="0"
                  max="120"
                  step="0.1"
                  value={ageYears}
                  onChange={(e) => setAgeYears(e.target.value)}
                  placeholder="مثال: 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageMonths">سن (ماه)</Label>
                <Input
                  id="ageMonths"
                  type="number"
                  min="0"
                  max="11"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(e.target.value)}
                  placeholder="مثال: 6"
                />
              </div>
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-1">
                <Weight className="h-4 w-4" />
                وزن (کیلوگرم)
              </Label>
              <Input
                id="weight"
                type="number"
                min="0.5"
                max="300"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="مثال: 20.5"
              />
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={calculateDose} 
                disabled={loading}
                variant="default"
                size="auth"
                className="flex-1 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    در حال محاسبه...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    محاسبه دوز
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="auth"
                onClick={resetForm}
                className="w-full sm:w-auto"
              >
                پاک کردن
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.isSafe ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                نتیجه محاسبه
              </CardTitle>
              <CardDescription>
                دوز محاسبه شده برای {result.drug.nameFa}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drug Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">اطلاعات دارو</h3>
                <p><strong>نام:</strong> {result.drug.nameFa} ({result.drug.nameEn})</p>
                <p><strong>نام علمی:</strong> {result.drug.genericName}</p>
                <Badge variant="secondary">{ageGroupLabels[result.ageGroup]}</Badge>
              </div>

              {/* Dose Results */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">دوز هر بار:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {result.calculatedDoseMg} میلی‌گرم
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">تعداد دفعات در روز:</span>
                  <span className="text-lg font-bold text-green-600">
                    {result.dosesPerDay} بار
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">دوز کل روزانه:</span>
                  <span className="text-lg font-bold text-purple-600">
                    {result.totalDailyDoseMg} میلی‌گرم
                  </span>
                </div>
              </div>

              {/* Safety Status */}
              <div className={`p-4 rounded-lg ${
                result.isSafe ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.isSafe ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    result.isSafe ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.isSafe ? 'دوز ایمن' : 'نیاز به احتیاط'}
                  </span>
                </div>
                {result.safetyWarnings.length > 0 && (
                  <ul className="text-sm space-y-1">
                    {result.safetyWarnings.map((warning, index) => (
                      <li key={index} className="text-red-700">• {warning}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Calculation Notes */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">توضیحات محاسبه:</h4>
                <p className="text-sm text-gray-700">{result.calculationNotes}</p>
              </div>

              {/* Print Button */}
              <Button 
                onClick={printResult} 
                variant="outline" 
                size="auth"
                className="w-full"
              >
                چاپ نتیجه
              </Button>

              {/* Disclaimer */}
              <div className="text-xs text-gray-500 text-center p-3 bg-yellow-50 rounded-lg">
                ⚠️ این محاسبه صرفاً جهت راهنمایی است و جایگزین مشاوره پزشکی نمی‌باشد.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}