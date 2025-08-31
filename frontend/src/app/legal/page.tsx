import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, Eye, FileText } from 'lucide-react';

export default function LegalPage() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">قوانین و مقررات</h2>
          <p className="text-gray-600">
            لطفاً قبل از استفاده از سرویس، شرایط زیر را به دقت مطالعه کنید.
          </p>
        </div>

        <div className="space-y-6">
          {/* Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                سلب مسئولیت پزشکی
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">
                  ⚠️ هشدار مهم: این اپلیکیشن صرفاً جنبه آموزشی دارد
                </p>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li>• این سیستم جایگزین مشاوره، تشخیص یا درمان پزشک نیست</li>
                  <li>• همیشه قبل از مصرف هر دارو با پزشک یا داروساز مشورت کنید</li>
                  <li>• در صورت وجود علائم شدید، فوراً به پزشک مراجعه کنید</li>
                  <li>• مسئولیت استفاده از اطلاعات ارائه شده بر عهده کاربر است</li>
                </ul>
              </div>
              
              <h4 className="font-semibold">محدودیت‌های سیستم:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• این سیستم تنها برای داروهای بدون نسخه (OTC) طراحی شده است</li>
                <li>• تشخیص‌های پیچیده و بیماری‌های جدی خارج از حیطه این سیستم است</li>
                <li>• اطلاعات ارائه شده بر اساس پروتکل‌های عمومی است و ممکن است برای همه افراد مناسب نباشد</li>
                <li>• در صورت داشتن آلرژی، بیماری مزمن یا مصرف داروهای تجویزی، حتماً با پزشک مشورت کنید</li>
              </ul>
            </CardContent>
          </Card>

          {/* Terms of Service */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                شرایط استفاده
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">پذیرش شرایط:</h4>
              <p className="text-gray-700">
                با استفاده از این سرویس، شما تأیید می‌کنید که شرایط و محدودیت‌های ذکر شده را مطالعه کرده و می‌پذیرید.
              </p>
              
              <h4 className="font-semibold">استفاده مجاز:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• این سرویس تنها برای استفاده شخصی و غیرتجاری ارائه شده است</li>
                <li>• ممنوعیت استفاده از اطلاعات برای اهداف تجاری بدون اجازه</li>
                <li>• ممنوعیت تلاش برای دسترسی غیرمجاز به سیستم</li>
                <li>• ممنوعیت ارسال اطلاعات نادرست یا مضر</li>
              </ul>
              
              <h4 className="font-semibold">محدودیت مسئولیت:</h4>
              <p className="text-gray-700">
                ارائه‌دهندگان این سرویس هیچ‌گونه مسئولیتی در قبال عواقب استفاده از اطلاعات ارائه شده ندارند.
                کاربران باید با آگاهی کامل از محدودیت‌ها و با مشورت متخصصان از این سرویس استفاده کنند.
              </p>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                حریم خصوصی
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">جمع‌آوری اطلاعات:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• اطلاعات شخصی شما (سن، جنس، علائم) تنها برای ارائه پیشنهادات استفاده می‌شود</li>
                <li>• هیچ اطلاعات شناسایی شخصی (نام، آدرس، تلفن) جمع‌آوری نمی‌شود</li>
                <li>• اطلاعات وارد شده پس از ارائه نتایج حذف می‌شود</li>
                <li>• از کوکی‌ها تنها برای بهبود عملکرد سایت استفاده می‌شود</li>
              </ul>
              
              <h4 className="font-semibold">حفاظت از اطلاعات:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• تمام اطلاعات با استفاده از پروتکل‌های امنیتی رمزگذاری می‌شود</li>
                <li>• دسترسی به اطلاعات محدود به سیستم‌های ضروری است</li>
                <li>• هیچ اطلاعاتی با اشخاص ثالث به اشتراک گذاشته نمی‌شود</li>
                <li>• آمار کلی و ناشناس ممکن است برای بهبود سرویس استفاده شود</li>
              </ul>
              
              <h4 className="font-semibold">حقوق کاربران:</h4>
              <p className="text-gray-700">
                کاربران حق دارند در هر زمان از استفاده از سرویس خودداری کنند.
                در صورت نگرانی درباره حریم خصوصی، می‌توانید با ما تماس بگیرید.
              </p>
            </CardContent>
          </Card>

          {/* Age Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle>محدودیت‌های سنی</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">توجه ویژه برای کودکان:</h4>
                <ul className="text-yellow-700 space-y-1 text-sm">
                  <li>• داروهای سرفه/سرماخوردگی خوراکی برای کودکان زیر ۶ سال توصیه نمی‌شوند</li>
                  <li>• برای کودکان زیر ۴ سال، مصرف این داروها ممنوع است مگر با دستور پزشک</li>
                  <li>• والدین باید همیشه قبل از دادن هر دارو به کودک با پزشک مشورت کنند</li>
                  <li>• دوز داروها برای کودکان باید دقیقاً بر اساس وزن و سن محاسبه شود</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Pregnancy Warning */}
          <Card>
            <CardHeader>
              <CardTitle>هشدارهای بارداری</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h4 className="font-semibold text-pink-800 mb-2">مادران باردار و شیرده:</h4>
                <ul className="text-pink-700 space-y-1 text-sm">
                  <li>• NSAID ها (مانند ایبوپروفن) در بارداری ≥۲۰ هفته توصیه نمی‌شوند</li>
                  <li>• از استامینوفن استفاده کنید مگر اینکه پزشک منع کرده باشد</li>
                  <li>• همیشه قبل از مصرف هر دارو در دوران بارداری و شیردهی با پزشک مشورت کنید</li>
                  <li>• برخی داروهای گیاهی نیز ممکن است برای بارداری مضر باشند</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>تماس با ما</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                در صورت داشتن سؤال یا نگرانی درباره این سرویس، می‌توانید با ما در تماس باشید:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>ایمیل پشتیبانی:</strong> support@otc-advisor.com<br/>
                  <strong>آخرین به‌روزرسانی:</strong> {new Date().toLocaleDateString('fa-IR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}