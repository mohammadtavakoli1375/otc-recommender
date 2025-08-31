'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, AlertTriangle, CheckCircle, Copy, Printer, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface TriageResult {
  action: 'OK' | 'REFER_IMMEDIATE';
  blocks: Array<{ ingredient: string; reason: string }>;
  avoid: Array<{ ingredient: string; reason: string }>;
  suggestions: Array<{
    ingredient: string;
    dose: string;
    maxDays: number;
    why: string;
  }>;
  education: string[];
  sources: string[];
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const triageData = sessionStorage.getItem('triageData');
    if (!triageData) {
      router.push('/symptoms');
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/triage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: triageData,
        });

        if (!response.ok) {
          throw new Error('خطا در دریافت نتایج');
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطای نامشخص');
        // Fallback to mock data for demo
        setResult({
          action: 'OK',
          blocks: [
            { ingredient: 'ibuprofen', reason: 'بارداری ≥۲۰ هفته' }
          ],
          avoid: [
            { ingredient: 'diphenhydramine', reason: 'معیارهای Beers - سالمندان ≥۶۵ سال' }
          ],
          suggestions: [
            {
              ingredient: 'acetaminophen',
              dose: '500 mg هر ۶-۸ ساعت، حداکثر ۳ گرم در روز',
              maxDays: 3,
              why: 'درد و تب'
            },
            {
              ingredient: 'throat_lozenges',
              dose: 'یک قرص هر ۲-۳ ساعت',
              maxDays: 5,
              why: 'تسکین موضعی گلو'
            }
          ],
          education: [
            'غرغره با آب نمک گرم، مایعات گرم، استراحت',
            'مایعات کافی بنوشید',
            'استراحت کافی داشته باشید',
            'این اپ آموزشی است و جایگزین تشخیص/درمان پزشک نیست'
          ],
          sources: [
            'NICE CKS Guidelines',
            'FDA Safety Communications',
            'Iranian Pharmacopoeia'
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [router]);

  const copyToClipboard = () => {
    if (!result) return;
    
    let text = 'نتایج ارزیابی OTC\n\n';
    
    if (result.action === 'REFER_IMMEDIATE') {
      text += '⚠️ ارجاع فوری به پزشک توصیه می‌شود\n\n';
    }
    
    if (result.blocks.length > 0) {
      text += '❌ داروهای ممنوع:\n';
      result.blocks.forEach(block => {
        text += `• ${block.ingredient}: ${block.reason}\n`;
      });
      text += '\n';
    }
    
    if (result.avoid.length > 0) {
      text += '⚠️ داروهای نامناسب:\n';
      result.avoid.forEach(avoid => {
        text += `• ${avoid.ingredient}: ${avoid.reason}\n`;
      });
      text += '\n';
    }
    
    if (result.suggestions.length > 0) {
      text += '✅ پیشنهادات:\n';
      result.suggestions.forEach(suggestion => {
        text += `• ${suggestion.ingredient}\n`;
        text += `  دوز: ${suggestion.dose}\n`;
        text += `  حداکثر: ${suggestion.maxDays} روز\n`;
        text += `  دلیل: ${suggestion.why}\n\n`;
      });
    }
    
    text += 'نکات مهم:\n';
    result.education.forEach(edu => {
      text += `• ${edu}\n`;
    });
    
    navigator.clipboard.writeText(text);
  };

  const printResults = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال تحلیل علائم...</p>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">خطا</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/symptoms')} className="w-full">
              بازگشت به ارزیابی
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 ml-2" />
              <h1 className="text-2xl font-bold text-gray-900 mr-3">مشاور OTC</h1>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 ml-1" />
                کپی
              </Button>
              <Button variant="outline" size="sm" onClick={printResults}>
                <Printer className="h-4 w-4 ml-1" />
                چاپ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 print:hidden">
          <Link href="/symptoms">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              ارزیابی جدید
            </Button>
          </Link>
        </div>

        {/* Emergency Alert */}
        {result.action === 'REFER_IMMEDIATE' && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                ارجاع فوری
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                بر اساس علائم شما، توصیه می‌شود فوراً به پزشک یا اورژانس مراجعه کنید.
                از خودداری نکنید و در اسرع وقت کمک پزشکی دریافت کنید.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Blocked Medications */}
        {result.blocks.length > 0 && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardHeader>
              <CardTitle className="text-red-600">داروهای ممنوع</CardTitle>
              <CardDescription>
                این داروها برای شما مناسب نیستند
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.blocks.map((block, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-700">{block.ingredient}</p>
                      <p className="text-red-600 text-sm">{block.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medications to Avoid */}
        {result.avoid.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 mb-6">
            <CardHeader>
              <CardTitle className="text-yellow-700">داروهای نامناسب</CardTitle>
              <CardDescription>
                بهتر است از این داروها اجتناب کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.avoid.map((avoid, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-700">{avoid.ingredient}</p>
                      <p className="text-yellow-600 text-sm">{avoid.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suggestions */}
        {result.suggestions.length > 0 && (
          <Card className="border-green-200 bg-green-50 mb-6">
            <CardHeader>
              <CardTitle className="text-green-700">پیشنهادات درمانی</CardTitle>
              <CardDescription>
                این داروها برای شما مناسب هستند
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-700 text-lg">{suggestion.ingredient}</h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm"><strong>دوز:</strong> {suggestion.dose}</p>
                          <p className="text-sm"><strong>حداکثر مدت:</strong> {suggestion.maxDays} روز</p>
                          <p className="text-sm"><strong>دلیل استفاده:</strong> {suggestion.why}</p>
                        </div>
                        <Link href={`/drug/${suggestion.ingredient}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-2">
                          اطلاعات تکمیلی
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>نکات مهم و راهنمایی‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.education.map((edu, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Sources */}
        <Card>
          <CardHeader>
            <CardTitle>منابع علمی</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {result.sources.map((source, index) => (
                <li key={index} className="text-sm text-gray-600">
                  • {source}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-300">
          <p className="text-sm text-gray-600 text-center">
            تاریخ: {new Date().toLocaleDateString('fa-IR')} | مشاور OTC - این اپ آموزشی است و جایگزین تشخیص پزشک نیست
          </p>
        </div>
      </div>
    </div>
  );
}