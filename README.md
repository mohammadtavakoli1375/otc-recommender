# مشاور OTC - راهنمای هوشمند داروهای بدون نسخه

## 📋 درباره پروژه

مشاور OTC یک سیستم هوشمند برای پیشنهاد داروهای بدون نسخه (OTC) بر اساس علائم است که با استفاده از پروتکل‌های علمی و به‌روز طراحی شده است.

### ⚠️ هشدار مهم
**این اپلیکیشن صرفاً جنبه آموزشی دارد و جایگزین مشاوره، تشخیص یا درمان پزشک نیست.**

## 🏗️ معماری سیستم

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **Internationalization:** next-intl (FA/EN)
- **Forms:** react-hook-form + Zod
- **PWA:** Service Worker + Manifest
- **Accessibility:** WCAG 2.2 AA

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL 16 (مهاجرت شده از SQLite)
- **ORM:** Prisma
- **Cache:** Redis
- **Queue:** BullMQ (برای اعلانات)
- **Push Notifications:** Web Push با VAPID
- **SMS:** Kavenegar API
- **Security:** Helmet + Rate Limiting + CORS
- **Validation:** class-validator

### DevOps
- **CI/CD:** GitHub Actions
- **Testing:** Jest + Playwright
- **Monitoring:** Sentry + OpenTelemetry
- **Deployment:** Vercel (Frontend) + Render/Railway (Backend)

## 🚀 راه‌اندازی محیط توسعه

### پیش‌نیازها
- Node.js 18+
- npm یا yarn
- Docker و Docker Compose
- Git

### نصب و راه‌اندازی

1. **کلون کردن پروژه:**
```bash
git clone https://github.com/your-username/otc-recommender.git
cd otc-recommender
```

2. **راه‌اندازی PostgreSQL و Redis با Docker:**
```bash
# شروع PostgreSQL و pgAdmin
docker-compose up -d
```

3. **تولید VAPID Keys برای Push Notifications:**
```bash
npx web-push generate-vapid-keys
```

4. **راه‌اندازی Backend:**
```bash
cd backend
npm install

# کپی کردن فایل محیطی
cp .env.development .env

# ویرایش .env و اضافه کردن:
# VAPID_PUBLIC_KEY="your-public-key"
# VAPID_PRIVATE_KEY="your-private-key"
# SMS_API_KEY="your-kavenegar-api-key"

# تنظیم دیتابیس
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# اجرای سرور
npm run start:dev
```

5. **راه‌اندازی Frontend:**
```bash
cd frontend
npm install

# ایجاد فایل محیطی
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
echo "NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key" >> .env.local

# اجرای سرور توسعه
npm run dev
```

6. **دسترسی به اپلیکیشن:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- pgAdmin: http://localhost:5050 (admin@example.com / admin123)
- Prisma Studio: npx prisma studio (Port 5555)

## 📁 ساختار پروژه

```
otc-recommender/
├── backend/
│   ├── src/
│   │   ├── admin/          # پنل مدیریت
│   │   ├── triage/         # سیستم تریاژ
│   │   ├── rules/          # موتور قوانین
│   │   └── prisma/         # سرویس دیتابیس
│   ├── prisma/
│   │   ├── schema.prisma   # مدل دیتابیس
│   │   └── migrations/     # تغییرات دیتابیس
│   └── test/               # تست‌ها
├── frontend/
│   ├── src/
│   │   ├── app/            # صفحات Next.js
│   │   ├── components/     # کامپوننت‌های UI
│   │   └── lib/            # ابزارها و تنظیمات
│   ├── public/
│   │   ├── manifest.json   # PWA Manifest
│   │   └── sw.js          # Service Worker
│   └── __tests__/         # تست‌ها
├── .github/
│   └── workflows/         # CI/CD Pipeline
└── docs/                  # مستندات
```

## 🔧 API Documentation

### Endpoints اصلی

#### Triage API
- `POST /api/triage` - ارزیابی علائم
- `GET /api/triage/ingredients` - لیست داروها
- `GET /api/triage/protocols/:condition` - پروتکل‌های درمانی

#### Admin API
- `GET /api/admin/overview` - داشبورد مدیریت
- `CRUD /api/admin/protocols` - مدیریت پروتکل‌ها
- `CRUD /api/admin/ingredients` - مدیریت داروها
- `CRUD /api/admin/symptoms` - مدیریت علائم
- `CRUD /api/admin/conditions` - مدیریت بیماری‌ها

### نمونه درخواست Triage

```json
{
  "patient": {
    "age": 34,
    "sex": "F",
    "pregnantWeeks": 0,
    "isElder": false,
    "meds": []
  },
  "symptoms": ["sore_throat", "fever_low"],
  "durationDays": 2,
  "redFlags": {
    "airway": false,
    "bloodyDiarrhea": false
  }
}
```

### نمونه پاسخ Triage

```json
{
  "action": "OK",
  "blocks": [
    {
      "ingredient": "ibuprofen",
      "reason": "بارداری ≥۲۰ هفته"
    }
  ],
  "avoid": [
    {
      "ingredient": "diphenhydramine",
      "reason": "معیارهای Beers - سالمندان ≥۶۵ سال"
    }
  ],
  "suggestions": [
    {
      "ingredient": "acetaminophen",
      "dose": "500 mg هر ۶-۸ ساعت، حداکثر ۳ گرم در روز",
      "maxDays": 3,
      "why": "درد و تب"
    }
  ],
  "education": [
    "مایعات کافی بنوشید",
    "استراحت کافی داشته باشید"
  ],
  "sources": [
    "NICE CKS Guidelines",
    "FDA Safety Communications"
  ]
}
```

## 🔔 Push Notifications و SMS

### راه‌اندازی Push Notifications

1. **تولید VAPID Keys:**
```bash
npx web-push generate-vapid-keys
```

2. **تنظیم متغیرهای محیطی:**
```env
# Backend .env
VAPID_PUBLIC_KEY="your-public-key"
VAPID_PRIVATE_KEY="your-private-key"
VAPID_SUBJECT="mailto:admin@otc-recommender.com"

# Frontend .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
```

3. **استفاده در کد:**
```typescript
// Subscribe to push notifications
import { pushNotificationManager } from '@/lib/push-notifications';

const subscription = await pushNotificationManager.subscribe();
if (subscription) {
  await pushNotificationManager.sendSubscriptionToServer(subscription);
}
```

### راه‌اندازی SMS با Kavenegar

1. **دریافت API Key:**
   - ثبت‌نام در [Kavenegar](https://kavenegar.com)
   - دریافت API Key از پنل کاربری

2. **تنظیم متغیرهای محیطی:**
```env
SMS_API_KEY="your-kavenegar-api-key"
SMS_SENDER="10008663"
SMS_BASE_URL="https://api.kavenegar.com/v1"
```

3. **تست ارسال SMS:**
```bash
# از طریق API
curl -X POST http://localhost:3001/notifications/sms/test \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "09123456789"}'
```

### API Endpoints اعلانات

```bash
# Push Notifications
POST   /notifications/push/subscribe      # اشتراک push
DELETE /notifications/push/unsubscribe   # لغو اشتراک
GET    /notifications/push/subscriptions # لیست اشتراک‌ها
POST   /notifications/push/test           # ارسال تست

# SMS
POST   /notifications/sms/test           # ارسال SMS تست

# Phone Verification
POST   /auth/send-otp                    # ارسال کد تأیید
POST   /auth/verify-otp                  # تأیید کد
POST   /auth/resend-otp                  # ارسال مجدد کد

# Preferences
GET    /notifications/preferences        # دریافت تنظیمات
PUT    /notifications/preferences        # به‌روزرسانی تنظیمات

# History
GET    /notifications/history            # تاریخچه ارسال
POST   /notifications/retry/:deliveryId  # تلاش مجدد
```

### ویژگی‌های پیشرفته

- **Queue Processing:** استفاده از BullMQ برای پردازش ناهمزمان
- **Retry Logic:** تلاش مجدد خودکار در صورت خطا
- **Delivery Tracking:** ردیابی کامل وضعیت ارسال
- **User Preferences:** تنظیمات شخصی‌سازی شده
- **Phone Verification:** تأیید شماره موبایل با OTP
- **PWA Support:** پشتیبانی کامل Progressive Web App

## 🧪 تست‌ها

### اجرای تست‌های Backend
```bash
cd backend

# تست‌های واحد
npm run test

# تست‌های انتها به انتها
npm run test:e2e

# پوشش تست
npm run test:cov
```

### اجرای تست‌های Frontend
```bash
cd frontend

# تست‌های واحد
npm run test

# تست‌های دسترس‌پذیری
npx playwright test --grep="accessibility"
```

## 🔒 امنیت

### اقدامات امنیتی پیاده‌سازی شده
- Helmet.js برای تنظیم هدرهای امنیتی
- Rate Limiting برای جلوگیری از حملات DDoS
- CORS محدود شده
- Validation ورودی‌ها
- عدم لاگ اطلاعات شخصی (PII)
- HTTPS اجباری در production

### بررسی امنیت
```bash
# بررسی آسیب‌پذیری‌های dependencies
npm audit

# اسکن امنیتی کد
npm run security:scan
```

## 📱 PWA Features

- نصب روی دستگاه موبایل
- کار آفلاین محدود
- Cache استراتژی برای بهبود عملکرد
- Manifest فایل کامل
- Service Worker برای مدیریت cache

## 🌐 چندزبانه (i18n)

- پشتیبانی از فارسی و انگلیسی
- RTL کامل برای فارسی
- فونت Vazirmatn برای متن فارسی
- ترجمه تمام رابط کاربری

## ♿ دسترس‌پذیری

- مطابق با استاندارد WCAG 2.2 AA
- پشتیبانی از screen reader
- Navigation با کیبورد
- High contrast mode
- Focus indicators واضح
- ARIA labels مناسب

## 📊 Monitoring و Analytics

### Monitoring
- Health check endpoints
- Error tracking با Sentry
- Performance monitoring
- Uptime monitoring

### Analytics
- رویدادهای کاربری (بدون PII)
- آمار استفاده از features
- Performance metrics
- Error rates

## 🚀 Deployment

### Frontend (Vercel)
```bash
# نصب Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Backend (Render/Railway)
```bash
# تنظیم متغیرهای محیطی
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret
NODE_ENV=production

# Build و Deploy
npm run build
npm run start:prod
```

## 🤝 مشارکت در پروژه

1. Fork کردن پروژه
2. ایجاد branch جدید (`git checkout -b feature/amazing-feature`)
3. Commit تغییرات (`git commit -m 'Add amazing feature'`)
4. Push به branch (`git push origin feature/amazing-feature`)
5. ایجاد Pull Request

### راهنمای Coding Style
- استفاده از ESLint و Prettier
- TypeScript strict mode
- نام‌گذاری واضح و معنادار
- کامنت‌گذاری کد پیچیده
- تست نوشتن برای features جدید

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای جزئیات بیشتر فایل [LICENSE](LICENSE) را مطالعه کنید.

## 📞 تماس و پشتیبانی

- **ایمیل:** support@otc-advisor.com
- **GitHub Issues:** [لینک به issues](https://github.com/your-username/otc-recommender/issues)
- **Documentation:** [لینک به docs](https://docs.otc-advisor.com)

## 🙏 تشکر

- [NICE CKS Guidelines](https://cks.nice.org.uk/)
- [FDA Safety Communications](https://www.fda.gov/)
- [Iranian Pharmacopoeia](http://www.iri-pharmacopoeia.ir/)
- تمام کتابخانه‌ها و ابزارهای open source استفاده شده

---

**⚠️ یادآوری مهم:** این سیستم تنها برای اهداف آموزشی طراحی شده و نباید به عنوان جایگزین مشاوره پزشکی استفاده شود. همیشه قبل از مصرف هر دارو با پزشک یا داروساز مشورت کنید.