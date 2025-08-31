# گزارش تحلیل جامع پروژه OTC Recommender

## 📋 خلاصه اجرایی

**نام پروژه:** OTC Recommender (سیستم هوشمند مشاوره داروهای بدون نسخه)

**هدف:** ارائه سیستم هوشمند برای تشخیص علائم، محاسبه دوز داروهای بدون نسخه و مشاوره پزشکی اولیه

**وضعیت:** کامل، عملیاتی و در حال اجرا

**تکنولوژی‌های اصلی:**
- Frontend: Next.js 15.4.7 + TypeScript + Tailwind CSS + PWA
- Backend: NestJS + TypeScript + Prisma ORM
- Database: SQLite (Development) / PostgreSQL 16 (Production)
- Authentication: JWT + Phone Verification (OTP)
- UI Components: shadcn/ui + Framer Motion + Enhanced Button Variants
- Notifications: Web Push (VAPID) + SMS (Kavenegar)
- Queue Management: BullMQ + Redis
- Testing: Playwright E2E Tests
- Containerization: Docker + Docker Compose
- Database Management: pgAdmin 4
- Enhanced UX: Modern Auth Buttons با گرادیانت و انیمیشن‌های تعاملی

---

## 🏗️ معماری سیستم

### ساختار کلی
```
OTC Recommender/
├── frontend/              # Next.js Application
├── backend/               # NestJS API Server
│   ├── scripts/           # Migration & Backup Scripts
│   ├── prisma/            # Database Schema & Seeds
│   └── .env.*             # Environment Configurations
├── docker-compose.yml     # PostgreSQL + pgAdmin Setup
├── MIGRATION_README.md    # Database Migration Guide
├── PROJECT_ANALYSIS_REPORT.md # Comprehensive Project Analysis
├── vazirmatn-v33.003/     # Persian Font Assets
└── .dockerignore          # Docker Build Optimization
```

### معماری Frontend (Next.js)
```
frontend/src/
├── app/
│   ├── api/                    # API Routes (Proxy to Backend)
│   │   ├── auth/
│   │   ├── dose-calculator/
│   │   ├── education/
│   │   ├── neshan-search/      # نشان API پروکسی با timeout
│   │   └── profile/
│   ├── auth/                   # Authentication Pages
│   │   ├── login/
│   │   └── register/
│   ├── dose-calculator/        # Dose Calculator Page
│   ├── education/              # Educational Content
│   ├── profile/                # User Profile Management
│   ├── symptoms/               # Symptom Assessment
│   ├── layout.tsx              # Root Layout
│   └── page.tsx                # Enhanced Home Page (Mobile-First)
├── components/
│   ├── ui/                     # shadcn/ui Components
│   ├── home/                   # Home Page Components (Snapp-inspired)
│   │   ├── HeaderCompact.tsx   # هدر کامپکت با منوی همبرگری مدرن
│   │   ├── SearchBar.tsx       # نوار جستجو با placeholder فارسی
│   │   ├── QuickActions.tsx    # 4 اکشن سریع (یادآورها، اعلان‌ها، FAQ، پروفایل)
│   │   ├── ServicesGrid.tsx    # گرید 2x3 خدمات اصلی با گرادیانت
│   │   ├── HeroBanner.tsx      # بنر اسلایدری با ایلوستریشن
│   │   ├── EducationalCategories.tsx # اسکرول افقی دسته‌بندی‌ها
│   │   ├── PopularContent.tsx  # کارت‌های مقالات محبوب
│   │   ├── EducationalAlert.tsx # Alert هشدار با shadcn/ui
│   │   ├── QuickFAQ.tsx        # آکاردئون سوالات متداول
│   │   └── DarkModeToggle.tsx  # سوییچ تم روشن/تاریک
│   ├── maps/                   # Maps & Pharmacy Components
│   │   └── PharmacyFinder.tsx  # جستجوی داروخانه با نشان API
│   ├── navigation/             # Navigation Components
│   │   └── BottomNavigation.tsx # نوار ناوبری پایینی با آیکون برجسته
│   ├── navigation.tsx          # Main Navigation (Desktop)
│   ├── notification-settings.tsx # Notification Preferences
│   ├── phone-verification.tsx  # Phone OTP Verification
│   └── enhanced-reminder-form.tsx # Advanced Reminder Form
└── lib/
    ├── utils.ts                # Utility Functions
    └── push-notifications.ts   # Push Notification Manager
```

### معماری Backend (NestJS)
```
backend/
├── src/
│   ├── auth/                   # Authentication Module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   ├── dose-calculator/        # Dose Calculation Module
│   │   ├── dose-calculator.controller.ts
│   │   └── dose-calculator.service.ts
│   ├── educational-content/    # Educational Content Module
│   │   ├── educational-content.controller.ts
│   │   └── educational-content.service.ts
│   ├── patient-profile/        # Patient Profile Module
│   │   ├── patient-profile.controller.ts
│   │   ├── patient-profile.service.ts
│   │   └── dto/
│   ├── notifications/          # Notifications Module
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── web-push.service.ts
│   │   ├── sms.service.ts
│   │   ├── notification.processor.ts
│   │   └── notifications.module.ts
│   ├── maps/                   # Maps & Pharmacy Search Module
│   │   ├── maps.controller.ts
│   │   ├── maps.service.ts
│   │   └── maps.module.ts
│   ├── reminders/              # Medication Reminders
│   ├── rules/                  # Business Rules Engine
│   ├── triage/                 # Symptom Triage System
│   ├── prisma/                 # Database Service
│   ├── app.controller.ts       # Health Check Endpoint
│   └── main.ts                 # Application Entry Point
├── scripts/
│   ├── migrate-sqlite-to-postgres.ts  # Data Migration Script
│   └── backup-database.ts      # Database Backup Script
├── prisma/
│   ├── schema.prisma           # PostgreSQL Schema
│   ├── seed.ts                 # Database Seeding
│   ├── seed-drugs.ts           # Drug Data Seeding
│   └── seed-educational-content.ts # Content Seeding
├── .env.development            # Development Environment
├── .env.staging                # Staging Environment
└── .env.production             # Production Environment
```

---

## 🗄️ مدل دیتابیس

### جداول اصلی

#### 1. Users (کاربران)
```sql
Users {
  id: String (Primary Key)
  email: String (Unique)
  password: String
  phone: String? (Iranian Mobile Number)
  phone_verified: Boolean (Default: false)
  notification_preferences: String? (JSON)
  role: UserRole (PHARMACIST, ADMIN, VIEWER)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 2. PatientProfiles (پروفایل بیماران)
```sql
PatientProfiles {
  id: String (Primary Key)
  user_id: String (Foreign Key -> Users.id)
  first_name: String
  last_name: String
  date_of_birth: DateTime
  gender: Gender (MALE, FEMALE, OTHER)
  weight_kg: Float
  height_cm: Float?
  phone: String?
  emergency_contact: String?
  blood_type: String?
  allergies: String? (JSON)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 3. MedicalHistory (سابقه پزشکی)
```sql
MedicalHistory {
  id: String (Primary Key)
  patient_profile_id: String (Foreign Key)
  condition_name: String
  condition_type: MedicalConditionType
  diagnosed_date: DateTime?
  is_chronic: Boolean
  is_active: Boolean
  notes: String?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 4. Drugs (داروها)
```sql
Drugs {
  id: String (Primary Key)
  name_fa: String
  name_en: String
  generic_name: String (Unique)
  brand_names: String? (JSON)
  atc_code: String?
  infant_dose_mg_kg: Float?
  child_dose_mg_kg: Float?
  adult_dose_mg: Float?
  max_single_dose_mg: Float?
  max_daily_dose_mg: Float?
  min_age_months: Int?
  max_age_years: Int?
  contraindications: String? (JSON)
  drug_interactions: String? (JSON)
  warnings: String? (JSON)
  dosing_interval_hours: Int
  max_doses_per_day: Int
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 5. DoseCalculations (محاسبات دوز)
```sql
DoseCalculations {
  id: String (Primary Key)
  drug_id: String (Foreign Key)
  user_id: String? (Foreign Key)
  patient_age_years: Float
  patient_age_months: Int
  patient_weight_kg: Float
  age_group: AgeGroup (INFANT, CHILD, ADULT)
  calculated_dose_mg: Float
  calculated_dose_ml: Float?
  doses_per_day: Int
  total_daily_dose_mg: Float
  is_safe: Boolean
  safety_warnings: String? (JSON)
  calculation_notes: String?
  calculated_by: String?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 6. Reminders (یادآوری‌ها)
```sql
Reminders {
  id: String (Primary Key)
  patient_profile_id: String (Foreign Key)
  medication_history_id: String? (Foreign Key)
  title: String
  description: String?
  medication_name: String
  dosage: String
  start_date: DateTime
  end_date: DateTime?
  frequency_type: FrequencyType
  frequency_value: Int
  times_per_day: Int
  specific_times: String? (JSON)
  is_active: Boolean
  notification_enabled: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 7. EducationalContent (محتوای آموزشی)
```sql
EducationalContent {
  id: String (Primary Key)
  title_fa: String
  title_en: String?
  content_fa: String (Markdown)
  content_en: String? (Markdown)
  summary_fa: String?
  summary_en: String?
  category: ContentCategory
  type: ContentType
  slug: String (Unique)
  tags: String? (JSON)
  featured_image: String?
  view_count: Int
  is_featured: Boolean
  is_published: Boolean
  published_by: String?
  published_at: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 8. FAQ (سوالات متداول)
```sql
FAQ {
  id: String (Primary Key)
  question_fa: String
  question_en: String?
  answer_fa: String
  answer_en: String?
  category: FAQCategory
  slug: String (Unique)
  tags: String? (JSON)
  is_featured: Boolean
  view_count: Int
  is_published: Boolean
  published_by: String?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 9. PushSubscription (اشتراک‌های Push)
```sql
PushSubscription {
  id: String (Primary Key)
  user_id: String (Foreign Key -> Users.id)
  endpoint: String
  p256dh: String (VAPID Key)
  auth: String (Auth Key)
  user_agent: String?
  is_active: Boolean (Default: true)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 10. ReminderDelivery (تحویل یادآوری‌ها)
```sql
ReminderDelivery {
  id: String (Primary Key)
  reminder_id: String (Foreign Key -> Reminders.id)
  user_id: String (Foreign Key -> Users.id)
  channel: DeliveryChannel (PUSH, SMS, EMAIL)
  status: DeliveryStatus (SCHEDULED, SENT, FAILED, RETRY)
  scheduled_at: DateTime
  sent_at: DateTime?
  failed_at: DateTime?
  error_message: String?
  retry_count: Int (Default: 0)
  max_retries: Int (Default: 3)
  title: String
  body: String
  push_subscription_id: String?
  phone_number: String?
  email_address: String?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 11. Medication (داروهای شخصی) - جدید
```sql
Medication {
  id: String (Primary Key)
  user_id: String (Foreign Key -> Users.id)
  drug_name: String
  form: String? (قرص، شربت، کپسول)
  strength: String? (میزان دوز)
  notes: String?
  start_at: DateTime
  end_at: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 12. MedicationSchedule (زمان‌بندی داروها) - جدید
```sql
MedicationSchedule {
  id: String (Primary Key)
  medication_id: String (Foreign Key -> Medication.id)
  rule: ScheduleRule (DAILY, WEEKLY, INTERVAL, SPECIFIC_TIMES)
  times: String? (JSON - زمان‌های مشخص)
  interval_hrs: Int?
  max_per_day: Int?
  quiet_hours: String? (JSON - ساعات سکوت)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 13. MedicationAdherence (پیگیری مصرف) - جدید
```sql
MedicationAdherence {
  id: String (Primary Key)
  medication_id: String (Foreign Key -> Medication.id)
  due_at: DateTime
  status: AdherenceStatus (PENDING, TAKEN, SKIPPED, SNOOZED)
  taken_at: DateTime?
  snooze_until: DateTime?
  notes: String?
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🔧 قابلیت‌های اصلی

### 1. سیستم احراز هویت
- **ثبت‌نام و ورود کاربران**
- **JWT Token Authentication**
- **محافظت از API endpoints**
- **مدیریت نقش‌های کاربری**

### 2. مدیریت پروفایل بیمار
- **ثبت اطلاعات شخصی**
- **مدیریت سابقه پزشکی**
- **ثبت آلرژی‌ها و حساسیت‌ها**
- **مدیریت سابقه مصرف داروها**

### 3. ماشین‌حساب دوز
- **محاسبه دوز بر اساس سن و وزن**
- **پشتیبانی از گروه‌های سنی مختلف**
- **بررسی ایمنی و هشدارها**
- **ذخیره تاریخچه محاسبات**

### 4. سیستم تشخیص علائم
- **ارزیابی علائم کاربر**
- **پیشنهاد داروهای مناسب**
- **اعمال قوانین کسب‌وکار**
- **در نظر گیری شرایط خاص بیمار**

### 5. سیستم یادآوری
- **یادآوری مصرف دارو**
- **اعلانات مرورگر**
- **خروجی Google Calendar**
- **خروجی iCal**

### 6. محتوای آموزشی
- **مقالات آموزشی**
- **سوالات متداول**
- **راهنماهای کاربری**
- **مدیریت محتوا**

### 7. سیستم اعلانات (جدید)
- **Push Notifications با VAPID**
- **SMS Notifications با Kavenegar**
- **Phone Verification با OTP**
- **Multi-channel Delivery**
- **Notification Preferences**
- **Delivery Tracking & Analytics**
- **Retry Logic برای Failed Deliveries**
- **BullMQ Queue Processing**

### 8. سیستم مدیریت داروها (جدید)
- **صفحه /my-meds برای مدیریت داروهای شخصی**
- **فرم افزودن دارو با اعتبارسنجی کامل**
- **زمان‌بندی یادآوری‌های دارویی**
- **اکشن‌های Taken/Snooze/Skip برای هر دوز**
- **آمار و گزارش‌گیری مصرف داروها**
- **هشدارهای ایمنی و تداخل دارویی**
- **یکپارچگی با سیستم اعلانات**
- **پشتیبانی از انواع مختلف داروها و فرم‌ها**

### 9. سیستم جستجوی داروخانه (جدید)
- **یکپارچگی با نشان API برای جستجوی داروخانه‌های ایران**
- **جستجوی بر اساس موقعیت GPS کاربر**
- **شعاع جستجوی قابل تنظیم تا 100 کیلومتر**
- **نمایش فاصله و اطلاعات داروخانه‌ها**
- **مسیریابی مستقیم به داروخانه‌های انتخابی**
- **پشتیبانی از کاربران خارج از ایران با fallback به تهران**
- **رابط کاربری موبایل‌محور با modal design**
- **تشخیص خودکار محدوده جغرافیایی ایران**

### 10. Progressive Web App (PWA)
- **Service Worker**
- **Web App Manifest**
- **Offline Support**
- **Push Notification Support**
- **App-like Experience**
- **Install Prompt**

### 11. Enhanced User Experience (UX) - Snapp-Inspired Design
- **Mobile-First Design**: طراحی کاملاً موبایل‌محور الهام‌گرفته از Snapp
- **HeaderCompact**: هدر مینیمال با لوگو، منو و badge وضعیت
- **SearchBar**: جستجوی هوشمند با placeholder فارسی
- **QuickActions**: دسترسی سریع به 4 عملکرد اصلی
- **ServicesGrid**: گرید خدمات با گرادیانت‌های جذاب
- **HeroBanner**: بنر اسلایدری با ایلوستریشن و انیمیشن
- **EducationalCategories**: اسکرول افقی دسته‌بندی‌ها
- **Bottom Navigation Bar**: نوار ناوبری پایینی با آیکون برجسته وسط
- **Enhanced Auth Buttons**: دکمه‌های احراز هویت با طراحی مدرن و گرادیانت
- **Interactive Loading States**: انیمیشن‌های loading با spinner و متن توضیحی
- **Scale Animations**: hover effects با scale 1.05 و active scale 0.95
- **Gradient Backgrounds**: آبی برای login، سبز برای register
- **Shadow Effects**: سایه‌های پویا که در hover افزایش می‌یابند
- **Icon Integration**: آیکون‌های Lucide React در دکمه‌ها
- **Dark Mode Support**: تغییر تم با سوییچ شناور
- **Brand Colors**: رنگ آبی (#2563EB) و طیف رنگی هماهنگ
- **Rounded Corners**: گوشه‌های گرد 16-20px برای کارت‌ها
- **Smooth Animations**: Framer Motion با stagger effects
- **RTL Typography**: تایپوگرافی فارسی با فونت Vazirmatn
- **Accessibility (a11y)**: Focus states، کنتراست 4.5:1، Navigation
- **Performance Optimized**: Lazy loading، Code splitting، Image optimization

---

## 🔌 API Endpoints

### System APIs
```
GET  /                  # Welcome Message
GET  /health            # Health Check & Database Status
```

### Authentication APIs
```
POST /auth/register     # ثبت‌نام کاربر جدید
POST /auth/login        # ورود کاربر
GET  /auth/profile      # دریافت اطلاعات کاربر
```

### Patient Profile APIs
```
GET    /patient-profile                    # دریافت پروفایل
PUT    /patient-profile                    # بروزرسانی پروفایل
POST   /patient-profile/medical-history    # افزودن سابقه پزشکی
PUT    /patient-profile/medical-history/:id # بروزرسانی سابقه پزشکی
DELETE /patient-profile/medical-history/:id # حذف سابقه پزشکی
POST   /patient-profile/medication-history # افزودن سابقه دارویی
PUT    /patient-profile/medication-history/:id # بروزرسانی سابقه دارویی
DELETE /patient-profile/medication-history/:id # حذف سابقه دارویی
```

### Dose Calculator APIs
```
POST /dose-calculator/calculate    # محاسبه دوز دارو
GET  /dose-calculator/drugs        # لیست داروهای موجود
GET  /dose-calculator/history      # تاریخچه محاسبات
```

### Educational Content APIs
```
GET /educational-content/articles           # لیست مقالات
GET /educational-content/articles/:slug     # مقاله خاص
GET /educational-content/articles/:id/related # مقالات مرتبط
GET /educational-content/faqs               # لیست سوالات متداول
GET /educational-content/faqs/search        # جستجو در FAQ
GET /educational-content/faqs/:slug         # FAQ خاص
GET /educational-content/categories         # دسته‌بندی‌ها
GET /educational-content/faq-categories     # دسته‌بندی FAQ
```

### Reminders APIs
```
GET    /reminders           # لیست یادآوری‌ها
POST   /reminders           # ایجاد یادآوری جدید
PUT    /reminders/:id       # بروزرسانی یادآوری
DELETE /reminders/:id       # حذف یادآوری
GET    /reminders/:id/calendar # خروجی تقویم
```

### Notifications APIs (جدید)
```
# Push Notifications
POST   /notifications/push/subscribe      # اشتراک push notifications
DELETE /notifications/push/unsubscribe   # لغو اشتراک push
GET    /notifications/push/subscriptions # لیست اشتراک‌ها
POST   /notifications/push/test           # ارسال push تست

# SMS Notifications
POST   /notifications/sms/test            # ارسال SMS تست

# Phone Verification
POST   /auth/send-otp                     # ارسال کد تأیید
POST   /auth/verify-otp                   # تأیید کد OTP
POST   /auth/resend-otp                   # ارسال مجدد کد

# Notification Preferences
GET    /notifications/preferences         # دریافت تنظیمات
PUT    /notifications/preferences         # به‌روزرسانی تنظیمات

# Delivery Management
GET    /notifications/history             # تاریخچه ارسال
POST   /notifications/send                # ارسال فوری
POST   /notifications/retry/:deliveryId   # تلاش مجدد
```

### Medications APIs (جدید)
```
GET    /medications                       # لیست داروهای کاربر
POST   /medications                       # افزودن دارو جدید
GET    /medications/:id                   # جزئیات دارو
PATCH  /medications/:id                   # به‌روزرسانی دارو
DELETE /medications/:id                   # حذف دارو
POST   /medications/:id/schedule          # تنظیم زمان‌بندی
GET    /medications/stats                 # آمار مصرف داروها
POST   /medications/adherence/:adherenceId/mark # ثبت مصرف دارو
```

### Maps APIs (جدید)
```
GET    /maps/nearby                       # جستجوی داروخانه‌های اطراف (Backend)
GET    /api/neshan-search                 # پروکسی نشان API (Frontend)
# Query Parameters:
#   - q: string (optional) - جستجوی متنی (مثل "pharmacy")
#   - lat: number (required) - عرض جغرافیایی
#   - lng: number (required) - طول جغرافیایی
#   - radius: number (optional, default: 100000) - شعاع جستجو به متر

# Response Format:
# {
#   "success": true,
#   "data": [
#     {
#       "id": "neshan-pharmacy-1",
#       "name": "داروخانه نمونه",
#       "address": "آدرس کامل",
#       "distance": 1.2,
#       "location": { "lat": 35.123, "lng": 51.456 }
#     }
#   ],
#   "meta": {
#     "count": 15,
#     "coordinates": { "lat": 35.123, "lng": 51.456 },
#     "radius": 100000
#   }
# }

# Neshan API Proxy Features:
# - Server-side API key injection
# - 15s timeout management
# - Error handling و retry logic
# - Cache: no-store برای real-time data
# - Security: API key محافظت شده
```

---

## 🎨 رابط کاربری

### صفحات اصلی

#### 1. صفحه اصلی (`/`) - Snapp-Inspired Mobile-First Design
- **HeaderCompact**: هدر کامپکت با منوی همبرگری مدرن و انیمیشن‌های پیشرفته
- **SearchBar**: نوار جستجو با placeholder فارسی و آیکون ذره‌بین
- **QuickActions**: 4 آیتم افقی (یادآورها، اعلان‌ها، FAQ، پروفایل)
- **ServicesGrid**: گرید 2x3 خدمات اصلی با گرادیانت و آیکون‌های رنگی
- **HeroBanner**: بنر اسلایدری تمام‌عرض با ایلوستریشن و CTA
- **EducationalCategories**: اسکرول افقی دسته‌بندی‌های آموزشی
- **PopularContent**: کارت‌های مقالات محبوب با تصویر و متادیتا
- **EducationalAlert**: Alert هشدار با آیکون و لینک "بیشتر بخوانید"
- **QuickFAQ**: آکاردئون با 3 سوال رایج
- **BottomNavigation**: نوار ناوبری پایینی ثابت با آیکون برجسته وسط
- **DarkModeToggle**: سوییچ تم در گوشه پایین چپ
- **Mobile-First Design**: طراحی کاملاً موبایل‌محور با فاصله‌گذاری 8px
- **Framer Motion Animations**: انیمیشن‌های ورود با stagger 60-80ms
- **Brand Colors**: رنگ آبی (#2563EB) و گوشه‌های گرد 16-20px

#### 2. صفحه تشخیص علائم (`/symptoms`)
- **فرم انتخاب علائم**
- **ارزیابی هوشمند**
- **نمایش نتایج و پیشنهادات**
- **راهنمای کاربری**

#### 3. ماشین‌حساب دوز (`/dose-calculator`)
- **فرم ورود اطلاعات بیمار**
- **انتخاب دارو**
- **محاسبه و نمایش نتایج**
- **هشدارهای ایمنی**

#### 4. پروفایل کاربری (`/profile`)
- **مدیریت اطلاعات شخصی**
- **سابقه پزشکی**
- **سابقه مصرف داروها**
- **یادآوری‌های دارویی**

#### 5. محتوای آموزشی (`/education`)
- **مقالات آموزشی**
- **سوالات متداول**
- **جستجو و فیلتر**
- **دسته‌بندی محتوا**

#### 6. مدیریت داروها (`/my-meds`) - جدید
- **لیست داروهای شخصی کاربر**
- **فرم افزودن دارو با اعتبارسنجی**
- **کارت‌های دارو با اطلاعات کامل**
- **اکشن‌های Taken/Snooze/Skip**
- **آمار مصرف و پیگیری**
- **هشدارهای ایمنی**
- **یادآوری‌های زمان‌بندی شده**

#### 7. احراز هویت (`/auth/login`, `/auth/register`)
- **فرم ورود**
- **فرم ثبت‌نام**
- **اعتبارسنجی**
- **مدیریت خطاها**

### کامپوننت‌های UI

#### Navigation Components
```typescript
// Navigation.tsx - Desktop Navigation
- Logo و برند
- منوی افقی دسکتاپ
- دکمه‌های احراز هویت بهینه‌سازی شده
- نمایش وضعیت کاربر
- دکمه‌های موبایل با طراحی مدرن و گرادیانت

// BottomNavigation.tsx - Mobile Navigation
- نوار ناوبری پایینی ثابت
- 5 آیتم اصلی + پروفایل/ورود
- آیکون وسط برجسته (علائم) با دایره آبی
- آیکون‌ها با متن کوتاه
- Active state و hover effects
- فقط در موبایل نمایش داده می‌شود
```

#### shadcn/ui Components
```typescript
// کامپوننت‌های استاندارد UI
- Button, Input, Label
- Card, Alert, Badge
- Tabs, Dialog, Sheet
- Form, Select, Textarea
```

#### Enhanced Button Component
```typescript
// Button.tsx - Enhanced with Auth Variants
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-brand text-white hover:opacity-90",
        outline: "border border-gray-200 hover:bg-gray-50",
        ghost: "hover:bg-gray-50",
        login: "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-blue-500",
        register: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-green-500",
      },
      size: {
        sm: "h-9 px-3 rounded-lg",
        md: "h-10 px-4 rounded-xl",
        lg: "h-12 px-6 text-base rounded-2xl",
        auth: "h-14 px-8 text-lg rounded-2xl font-semibold"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "lg"
    }
  }
)

// ویژگی‌های کلیدی:
- گرادیانت‌های رنگی برای login (آبی) و register (سبز)
- انیمیشن‌های scale در hover و active
- سایه‌های پویا با shadow-lg تا shadow-xl
- Focus ring های رنگی برای accessibility
- Size auth ویژه برای صفحات احراز هویت (56px ارتفاع)
- Transition مدت 300ms برای تمام تغییرات
```

---

## 🔒 امنیت

### Authentication & Authorization
- **JWT Token-based Authentication**
- **Password Hashing (bcrypt)**
- **Protected Routes**
- **Role-based Access Control**

### Data Protection
- **Input Validation & Sanitization**
- **SQL Injection Prevention (Prisma ORM)**
- **XSS Protection**
- **CORS Configuration**

### Privacy
- **User Data Encryption**
- **Secure Session Management**
- **Privacy Policy Compliance**
- **Data Retention Policies**

---

## 📊 عملکرد و بهینه‌سازی

### Frontend Optimizations
- **Next.js App Router**
- **Server-Side Rendering (SSR)**
- **Static Site Generation (SSG)**
- **Image Optimization**
- **Code Splitting**
- **Lazy Loading**

### Backend Optimizations
- **Database Indexing**
- **Query Optimization**
- **Caching Strategies**
- **Connection Pooling**
- **Error Handling**

### Performance Metrics
- **Fast Loading Times**
- **Responsive Design**
- **Mobile-First Approach**
- **Accessibility (a11y)**

---

## 🧪 تست و کیفیت کد

### Testing Strategy
- **Unit Tests (Jest)**
- **Integration Tests**
- **E2E Tests (Playwright)**
- **Push Notification Tests**
- **Phone Verification Tests**
- **API Testing**
- **PWA Testing**

### Code Quality
- **TypeScript Strict Mode**
- **ESLint Configuration**
- **Prettier Code Formatting**
- **Git Hooks (Pre-commit)**

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Run tests
      - Build application
      - Deploy (if main branch)
```

---

## 🚀 استقرار و DevOps

### ✅ Production Environment (Vercel)
```bash
# 🌐 Live Production URL
https://otc-recommender-d6fvzyjss-mtpharma93-2893s-projects.vercel.app

# 🧪 Health Check Endpoints
curl https://otc-recommender-d6fvzyjss-mtpharma93-2893s-projects.vercel.app/api/__ping
# Expected: "ok"

curl https://otc-recommender-d6fvzyjss-mtpharma93-2893s-projects.vercel.app/api/
# Expected: "API is up"

# 📱 PWA Installation
# موبایل: "Add to Home Screen"
# دسکتاپ: آیکون نصب در آدرس بار

# 🔧 Vercel CLI Management
vercel --prod              # Deploy to production
vercel logs               # View runtime logs
vercel env ls             # List environment variables
```

### Development Environment
```bash
# Start PostgreSQL & pgAdmin with Docker (Optional)
docker-compose up -d

# Backend Setup & Start (Port 3001) ✅ RUNNING
cd backend
cp .env.development .env
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
# 🚀 Backend server running on port 3001

# Frontend (Port 3000) ✅ RUNNING
cd frontend
npm run dev
# ▲ Next.js 15.4.7 (Turbopack) - Ready in 2.3s
# - Local: http://localhost:3000

# Database Management
npx prisma studio          # Prisma Studio (Port 5555)
# pgAdmin: http://localhost:5050 (admin@example.com / admin123)
```

### ✅ Current Status (31 اوت 2025)
- 🌐 **Production Live**: `https://otc-recommender-d6fvzyjss-mtpharma93-2893s-projects.vercel.app`
- ✅ **Backend API**: `/api/*` routes فعال در Vercel Functions
- ✅ **Frontend**: Next.js 15.4.7 با Turbopack در Vercel Edge
- ✅ **Local Development**: Backend روی پورت 3001، Frontend روی پورت 3000
- ✅ **Database**: PostgreSQL (Neon) با connection pooling
- ✅ **Health Checks**: `/api/__ping` و `/api/` endpoints فعال
- ✅ **PWA**: Service Worker و Manifest فعال
- ✅ **Push Notifications**: VAPID keys تولید و آماده
- ✅ **Neshan API Proxy**: `/api/neshan-search` با timeout management
- ✅ **Security Keys**: JWT و VAPID keys تولید شده
- ✅ **Static Assets**: favicon.ico بهینه‌سازی شده
- ✅ **Vercel Config**: مینیمال برای auto-detection
- ✅ **Enhanced Auth Buttons**: طراحی مدرن با گرادیانت فعال
- ✅ **Interactive Loading States**: انیمیشن‌های spinner کامل
- ✅ **Scale Animations**: hover و active effects پیاده‌سازی شده
- ✅ **Button Component**: variant های login/register آماده
- ✅ **Maps Module**: یکپارچگی کامل با نشان API
- ✅ **Pharmacy Search**: جستجوی داروخانه‌ها در شعاع 100 کیلومتر
- ✅ **Geographic Detection**: تشخیص خودکار محدوده ایران
- ✅ **Fallback Strategy**: پشتیبانی کاربران خارج از ایران

### ✅ Production Deployment (Vercel)
- **✅ Deployed**: `https://otc-recommender-d6fvzyjss-mtpharma93-2893s-projects.vercel.app`
- **✅ Full-Stack**: Frontend (Next.js) + Backend (NestJS) یکپارچه
- **✅ Serverless Functions**: Backend API در Vercel Functions
- **✅ SQLite Database**: Embedded database بدون external dependencies
- **✅ Environment Variables**: تنظیمات production در Vercel
- **✅ SSL/TLS**: HTTPS خودکار Vercel
- **✅ Global CDN**: توزیع محتوا در سراسر جهان
- **✅ Auto Scaling**: مقیاس‌پذیری خودکار بر اساس ترافیک
- **✅ Zero Downtime**: استقرار بدون قطعی سرویس
- **✅ Git Integration**: Auto-deploy از GitHub
- **✅ Performance Monitoring**: نظارت عملکرد Vercel Analytics
- **✅ Error Tracking**: ردیابی خطاها در Real-time

### Environment Configuration

#### Development (.env.development)
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Authentication
JWT_SECRET="dev-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Redis Configuration
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0
REDIS_URL="redis://localhost:6379"

# VAPID Keys for Web Push
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:admin@otc-recommender.com"

# SMS Configuration (Kavenegar)
SMS_API_KEY="your-kavenegar-api-key"
SMS_SENDER="10008663"
SMS_BASE_URL="https://api.kavenegar.com/v1"

# Neshan Maps API Configuration
NESHAN_API_KEY="service.e9c662462b3843f28a54133c7b4b9470"
NESHAN_BASE_URL="https://api.neshan.org"
NESHAN_SEARCH_PATH="/v1/search"

# Environment
NODE_ENV="development"
PORT=3001
```

#### Staging (.env.staging)
```env
DATABASE_URL="postgresql://${STAGING_DB_USER}:${STAGING_DB_PASS}@${STAGING_DB_HOST}:5432/${STAGING_DB_NAME}?schema=public&sslmode=require"
JWT_SECRET="${STAGING_JWT_SECRET}"
JWT_EXPIRES_IN="7d"
NODE_ENV="staging"
```

#### Production (.env.production)
```env
DATABASE_URL="postgresql://${PROD_DB_USER}:${PROD_DB_PASS}@${PROD_DB_HOST}:5432/${PROD_DB_NAME}?schema=public&sslmode=require"
JWT_SECRET="${PROD_JWT_SECRET}"
JWT_EXPIRES_IN="7d"
NODE_ENV="production"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
```

---

## 📈 آمار و تحلیل

### Key Performance Indicators (KPIs)
- **User Registration Rate**
- **Daily Active Users**
- **Dose Calculations per Day**
- **Educational Content Views**
- **User Retention Rate**

### Analytics Integration
- **Google Analytics**
- **User Behavior Tracking**
- **Error Monitoring**
- **Performance Monitoring**

---

## 🔮 آینده و توسعه

### Planned Features
- **Mobile Application (React Native)**
- **AI-Powered Recommendations**
- **Telemedicine Integration**
- **Multi-language Support**
- **Advanced Analytics Dashboard**

### Technical Improvements
- **Microservices Architecture**
- **GraphQL API**
- **Real-time Notifications**
- **Advanced Caching**
- **Machine Learning Integration**

---

## 📚 مستندات و منابع

### Documentation Files
- `README.md` - راهنمای نصب و راه‌اندازی
- `PROJECT_ANALYSIS_REPORT.md` - گزارش تحلیل جامع پروژه
- `MIGRATION_README.md` - راهنمای مهاجرت از SQLite به PostgreSQL
- `project-overview.md` - نمای کلی پروژه
- `drug-recommendation-logic-analysis.md` - تحلیل منطق توصیه دارو
- `otc-expanded-dataset-fa.md` - مجموعه داده‌های گسترده
- `docker-compose.yml` - تنظیمات Docker برای PostgreSQL و pgAdmin

### External Resources
- **Next.js Documentation**
- **NestJS Documentation**
- **Prisma Documentation**
- **PostgreSQL Documentation**
- **Docker Documentation**
- **shadcn/ui Components**
- **Tailwind CSS**

---

## 🐳 Docker و DevOps

### Docker Services

#### PostgreSQL Database
```yaml
postgres:
  image: postgres:16
  environment:
    POSTGRES_DB: otc_dev
    POSTGRES_USER: otc_user
    POSTGRES_PASSWORD: supersecret
  ports:
    - "5432:5432"
  volumes:
    - pgdata:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U otc_user -d otc_dev"]
    interval: 10s
    timeout: 5s
    retries: 5
```

#### pgAdmin Management
```yaml
pgadmin:
  image: dpage/pgadmin4
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@example.com
    PGADMIN_DEFAULT_PASSWORD: admin123
  ports:
    - "5050:80"
  depends_on:
    - postgres
```

### Database Migration Scripts

#### NPM Scripts
```json
{
  "prisma:generate": "prisma generate",
  "prisma:migrate:dev": "prisma migrate dev",
  "prisma:migrate:deploy": "prisma migrate deploy",
  "prisma:studio": "prisma studio",
  "db:seed": "ts-node prisma/seed.ts",
  "db:migrate-data": "ts-node scripts/migrate-sqlite-to-postgres.ts",
  "db:backup": "ts-node scripts/backup-database.ts"
}
```

#### Migration Features
- **Automatic SQLite Backup**: قبل از مهاجرت
- **Batch Processing**: پردازش در دسته‌های 500 رکوردی
- **Transaction Safety**: تراکنش‌های امن
- **Foreign Key Respect**: رعایت ترتیب وابستگی‌ها
- **Error Handling**: مدیریت خطا و گزارش‌دهی
- **Progress Reporting**: گزارش پیشرفت مهاجرت

### Health Monitoring

#### Health Check Endpoint
```typescript
@Get('health')
async getHealth() {
  try {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    };
  } catch (error) {
    return {
      status: 'error',
      database: 'disconnected',
      error: error.message
    };
  }
}
```

### Backup & Recovery

#### Automated Backup
```bash
# Create backup
npm run db:backup

# Manual backup
pg_dump -h localhost -U otc_user -d otc_dev -Fc -f backups/otc_$(date +%F).dump
```

#### Recovery Process
```bash
# Restore from backup
pg_restore -h localhost -U otc_user -d otc_dev --clean --create backups/backup.dump
```

---

## 🎯 نتیجه‌گیری

### نقاط قوت پروژه
✅ **معماری مدرن و مقیاس‌پذیر**
✅ **رابط کاربری زیبا و کاربرپسند**
✅ **امنیت بالا و محافظت از داده‌ها**
✅ **عملکرد بهینه و سرعت بالا**
✅ **پشتیبانی کامل از زبان فارسی**
✅ **طراحی ریسپانسیو و موبایل‌محور**
✅ **Progressive Web App (PWA) کامل**
✅ **سیستم اعلانات پیشرفته (Push + SMS)**
✅ **Phone Verification با OTP**
✅ **Multi-channel Notification Delivery**
✅ **BullMQ Queue Processing**
✅ **Playwright E2E Testing**
✅ **Enhanced UX با Snapp-Inspired Mobile-First Design**
✅ **HeaderCompact و SearchBar هوشمند**
✅ **QuickActions و ServicesGrid با گرادیانت**
✅ **HeroBanner اسلایدری و EducationalCategories**
✅ **Bottom Navigation Bar با آیکون برجسته وسط**
✅ **Enhanced Auth Buttons با طراحی مدرن و گرادیانت**
✅ **Interactive Loading States با spinner انیمیشن**
✅ **Scale Animations و Shadow Effects پویا**
✅ **Button Component بهبود یافته با variant های login/register**
✅ **Icon Integration و Focus Ring های رنگی**
✅ **Dark Mode Support کامل با سوییچ شناور**
✅ **Brand Colors آبی (#2563EB) و RTL Typography**
✅ **Framer Motion Animations**
✅ **Accessibility (a11y) Standards**
✅ **سیستم مدیریت داروهای شخصی کامل**
✅ **زمان‌بندی و یادآوری هوشمند داروها**
✅ **پیگیری مصرف و آمار تفصیلی**
✅ **Navigation بهبود یافته با دسترسی شرطی**
✅ **سیستم جستجوی داروخانه با نشان API**
✅ **جستجوی بر اساس موقعیت GPS با شعاع 100 کیلومتر**
✅ **تشخیص خودکار محدوده جغرافیایی ایران**
✅ **پشتیبانی کاربران بین‌المللی با fallback**
✅ **مسیریابی مستقیم به داروخانه‌های انتخابی**
✅ **رابط کاربری موبایل‌محور برای جستجوی داروخانه**
✅ **منوی همبرگری مدرن با انیمیشن‌های روان**
✅ **طراحی کارت‌های خدمات با گرادیانت teal برای داروخانه‌ها**
✅ **UI/UX بهبود یافته با تعامل‌های هوشمند**
✅ **انیمیشن‌های slideInRight و backdrop blur effects**
✅ **مستندات جامع و کامل**
✅ **دیتابیس SQLite/PostgreSQL انعطاف‌پذیر**
✅ **Docker containerization**
✅ **اسکریپت‌های مهاجرت و بک‌آپ خودکار**
✅ **Health monitoring و نظارت سیستم**
✅ **محیط‌های توسعه جداگانه**

### ✅ Production Deployed Successfully
- 🌐 **Live URL**: `https://otc-recommender-d6fvzyjss-mtpharma93-2893s-projects.vercel.app`
- 🚀 **Vercel Full-Stack Deploy**: Frontend + Backend یکپارچه
- 💰 **کاملاً رایگان**: $0 هزینه ماهانه با Vercel Free Tier
- 🔧 **SQLite Database**: Embedded database بدون نیاز به external DB
- ⚡ **Auto Scaling**: مقیاس‌پذیری خودکار Vercel
- 🔒 **HTTPS**: امنیت کامل با SSL/TLS خودکار
- 🌍 **Global CDN**: دسترسی سریع از سراسر جهان
- 📱 **PWA Ready**: قابل نصب روی موبایل و دسکتاپ
- ✅ تمام قابلیت‌های اصلی پیاده‌سازی شده
- ✅ سیستم اعلانات کامل (Push + SMS + OTP)
- ✅ سیستم مدیریت داروهای شخصی کامل
- ✅ زمان‌بندی و یادآوری هوشمند داروها
- ✅ پیگیری مصرف و آمار تفصیلی
- ✅ Navigation بهبود یافته با دسترسی شرطی
- ✅ Progressive Web App (PWA) آماده
- ✅ Multi-database support (SQLite/PostgreSQL)
- ✅ Docker containerization پیاده‌سازی شده
- ✅ BullMQ Queue Processing فعال
- ✅ اسکریپت‌های مهاجرت و بک‌آپ آماده
- ✅ Health check endpoint فعال
- ✅ محیط‌های development/staging/production جداگانه
- ✅ Playwright E2E tests کامل
- ✅ Phone verification با OTP
- ✅ Notification preferences management
- ✅ Enhanced UX با Snapp-Inspired Mobile-First Design
- ✅ HeaderCompact، SearchBar و QuickActions
- ✅ ServicesGrid با گرادیانت و HeroBanner اسلایدری
- ✅ EducationalCategories و PopularContent
- ✅ Bottom Navigation Bar با آیکون برجسته وسط
- ✅ Optimized Mobile Auth Buttons با گرادیانت و افکت‌های لمسی
- ✅ Dark Mode Toggle شناور و Brand Colors آبی
- ✅ Framer Motion Animations با stagger effects
- ✅ Accessibility Standards (a11y)
- ✅ سیستم جستجوی داروخانه کامل با نشان API
- ✅ جستجوی موقعیت‌محور با GPS و شعاع 100 کیلومتر
- ✅ تشخیص جغرافیایی هوشمند و fallback strategy
- ✅ مسیریابی یکپارچه و رابط موبایل‌محور
- ✅ منوی همبرگری مدرن با انیمیشن‌های پیشرفته
- ✅ طراحی کارت‌های خدمات بهبود یافته
- ✅ UI/UX components با تعامل‌های روان
- ✅ API پروکسی نشان با timeout management
- ✅ کلیدهای امنیتی تولید شده (JWT + VAPID)
- ✅ Static assets بهینه‌سازی شده (favicon.ico)
- ✅ Vercel config مینیمال برای auto-detection
- ✅ PostgreSQL migration کامل با Neon
- ✅ امنیت و عملکرد بهینه‌سازی شده
- ✅ مستندات کامل و به‌روز
- ✅ CI/CD Pipeline راه‌اندازی شده

### Impact و ارزش تجاری
- 🎯 **بهبود دسترسی به مشاوره دارویی**
- 🎯 **کاهش خطاهای دارویی**
- 🎯 **افزایش آگاهی عمومی**
- 🎯 **بهبود کیفیت مراقبت‌های بهداشتی**
- 🎯 **کاهش هزینه‌های درمانی**

---

**تاریخ گزارش:** 31 اوت 2025
**نسخه:** 1.6.0
**وضعیت:** Production Optimized & Security Enhanced
**آخرین به‌روزرسانی:** API پروکسی نشان، کلیدهای امنیتی و بهینه‌سازی Vercel

*این گزارش شامل تمام جنبه‌های فنی، معماری، و تجاری پروژه OTC Recommender می‌باشد و برای ارزیابی جامع توسط تیم‌های فنی و تجاری طراحی شده است.*