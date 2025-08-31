# OTC Recommender - سیستم مشاور داروهای بدون نسخه

## نمای کلی پروژه

### هدف
سیستم هوشمند مشاوره داروهای OTC (Over-The-Counter) که بر اساس علائم کاربر، داروهای مناسب را پیشنهاد می‌دهد و تداخلات دارویی را بررسی می‌کند.

### تکنولوژی‌های استفاده شده
- **Frontend**: Next.js 15.4.7 + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Database**: SQLite (قابل تغییر به PostgreSQL)
- **UI Framework**: Radix UI + TailwindCSS
- **PWA**: Service Worker + Manifest
- **Language Support**: فارسی (RTL) + انگلیسی

## معماری سیستم

### Frontend Architecture
```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # صفحه اصلی
│   │   ├── symptoms/        # مشاور علائم
│   │   └── admin/           # پنل مدیریت
│   ├── components/          # کامپوننت‌های قابل استفاده مجدد
│   └── lib/                 # ابزارها و تنظیمات
├── public/                  # فایل‌های استاتیک
└── package.json
```

### Backend Architecture
```
backend/
├── src/
│   ├── admin/               # ماژول مدیریت
│   ├── rules/               # موتور قوانین دارویی
│   │   ├── rules-engine.ts  # منطق اصلی تریاژ
│   │   └── types.ts         # تایپ‌های TypeScript
│   ├── triage/              # ماژول تریاژ
│   └── prisma/              # تنظیمات دیتابیس
├── prisma/
│   ├── schema.prisma        # مدل دیتابیس
│   └── dev.db              # دیتابیس SQLite
└── package.json
```

## ویژگی‌های کلیدی

### 1. سیستم تریاژ هوشمند
- **ورودی**: علائم کاربر، سن، جنسیت، بارداری، شیردهی، داروهای مصرفی
- **پردازش**: موتور قوانین JSON-based
- **خروجی**: پیشنهاد داروهای مناسب + هشدارها + آموزش

### 2. دیتاست جامع داروهای OTC
```typescript
// نمونه ساختار دارو
{
  "generic": "استامینوفن",
  "class": "مسکن/ضدتب",
  "forms": ["قرص 325/500/650mg", "شربت کودکان"],
  "indications": ["تب", "درد خفیف تا متوسط", "سردرد"],
  "adult_dose": "500–1000mg هر 4–6 ساعت؛ حداکثر 3000mg/روز",
  "peds_dose": "10–15 mg/kg هر 4–6 ساعت",
  "age_min": 3,
  "pregnancy": "ایمن (انتخاب اول)",
  "lactation": "ایمن",
  "max_duration_days": 3,
  "hard_blocks": ["نارسایی شدید کبدی"],
  "soft_blocks": ["بیماری کبدی خفیف"],
  "contraindications": ["حساسیت شناخته‌شده"],
  "interactions": ["الکل", "وارفارین"],
  "red_flags": ["درد/تب بیش از 3 روز"],
  "education": ["از مجموع مصرف روزانه فراتر نروید"],
  "complementary_supplements": {
    "primary": ["ویتامین C (500-1000mg)", "زینک (8-15mg)"],
    "rationale": "تقویت سیستم ایمنی",
    "evidence": "مطالعات علمی"
  }
}
```

### 3. داروهای تخصصی اضافه شده

#### شربت‌های سرفه خشک (9 نوع):
- شربت دکسترومتورفان
- شربت دیفن هیدرامین
- شربت تیمکس (Thymex)
- شربت توسیان (Tussian) - گل‌دارو
- شربت برونکو باریج (Broncho Barij)
- زوفا عسلی رازک
- کالیک نوتک‌فار
- روتارین قائم‌دارو
- پلارژین بزرگسالان

#### شربت‌های سرفه خلط‌دار (5 نوع):
- شربت گایافنزین (Guaifenesin)
- شربت برم‌هگزین (Bromhexine)
- شربت استیل‌سیستئین (N-Acetylcysteine)
- شربت زوفا عسلی (Razak) - خلط‌آور
- شربت برونکو باریج خلط‌آور

### 4. سیستم بررسی تداخلات
```typescript
// منطق بررسی تداخل
checkDrugInteractions(drug: any, patientMeds: string[], avoid: BlockedIngredient[]): void {
  if (drug.interactions && drug.interactions.length > 0) {
    for (const interaction of drug.interactions) {
      if (patientMeds.some(med => med.toLowerCase().includes(interaction.toLowerCase()))) {
        avoid.push({
          ingredient: drug.generic,
          reason: `تداخل دارویی با ${interaction}`,
          severity: 'medium'
        });
      }
    }
  }
}
```

### 5. مکمل‌های علمی
هر دارو شامل مکمل‌های پیشنهادی مبتنی بر شواهد علمی:
- **Primary**: مکمل‌های اصلی
- **Rationale**: دلیل علمی
- **Evidence**: شواهد تحقیقاتی

## API Endpoints

### Triage API
```typescript
POST /api/triage
{
  "symptoms": ["headache", "fever"],
  "patientInfo": {
    "age": 25,
    "gender": "female",
    "isPregnant": false,
    "isLactating": false,
    "currentMedications": []
  }
}
```

### Admin API
```typescript
GET /api/admin/symptoms      # مدیریت علائم
GET /api/admin/conditions    # مدیریت شرایط
GET /api/admin/users         # مدیریت کاربران
GET /api/admin/releases      # مدیریت نسخه‌ها
```

## Database Schema

```prisma
model Symptom {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  category    String?
  severity    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Condition {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  symptoms    String[] // JSON array
  treatments  String[] // JSON array
  redFlags    String[] // JSON array
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## UI/UX Features

### 1. طراحی ریسپانسیو
- موبایل فرست
- تبلت و دسکتاپ
- PWA قابلیت‌ها

### 2. پشتیبانی کامل فارسی
- RTL Layout
- فونت Vazirmatn
- ترجمه کامل رابط کاربری

### 3. کامپوننت‌های shadcn/ui
```typescript
// نمونه کامپوننت
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
```

## Security Features

### 1. Input Validation
- Zod schema validation
- Sanitization
- Type safety

### 2. CORS Configuration
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

### 3. Rate Limiting
- API rate limiting
- Request throttling

## Performance Optimizations

### 1. Frontend
- Next.js Turbopack
- Image optimization
- Code splitting
- Static generation

### 2. Backend
- Prisma query optimization
- Caching strategies
- Efficient algorithms

## Testing Strategy

### 1. Unit Tests
```typescript
// نمونه تست
describe('RulesEngine', () => {
  it('should recommend acetaminophen for headache', () => {
    const result = rulesEngine.evaluateProtocol({
      symptoms: ['headache'],
      patientInfo: { age: 25, gender: 'male' }
    });
    expect(result.suggestions[0].ingredient).toBe('استامینوفن');
  });
});
```

### 2. Integration Tests
- API endpoint testing
- Database integration
- End-to-end workflows

## Deployment

### 1. Development
```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

### 2. Production
```bash
# Build
npm run build

# Start
npm run start
```

### 3. Environment Variables
```env
DATABASE_URL="file:./dev.db"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

## Key Algorithms

### 1. Symptom Mapping
```typescript
const SYMPTOM_TO_DRUG_MAPPING = {
  "headache": ["استامینوفن", "ایبوپروفن"],
  "سردرد": ["استامینوفن", "ایبوپروفن"],
  "cough_dry": ["شربت دکسترومتورفان", "شربت دیفن هیدرامین"],
  "سرفه خشک": ["شربت دکسترومتورفان", "شربت دیفن هیدرامین"]
};
```

### 2. Safety Checks
```typescript
private checkHardBlocks(candidates: any[], input: TriageInput): BlockedIngredient[] {
  const blocked: BlockedIngredient[] = [];
  
  for (const drug of candidates) {
    // Age restrictions
    if (input.patientInfo.age < drug.age_min) {
      blocked.push({
        ingredient: drug.generic,
        reason: `سن کمتر از ${drug.age_min} سال`,
        severity: 'high'
      });
    }
    
    // Pregnancy restrictions
    if (input.patientInfo.isPregnant && drug.pregnancy === 'ممنوع') {
      blocked.push({
        ingredient: drug.generic,
        reason: 'ممنوع در بارداری',
        severity: 'high'
      });
    }
  }
  
  return blocked;
}
```

## Innovation Points

### 1. علمی و مبتنی بر شواهد
- مکمل‌های پیشنهادی با منابع علمی
- دوزاژ دقیق بر اساس سن و وزن
- بررسی تداخلات دارویی

### 2. فارسی‌سازی کامل
- پشتیبانی دوزبانه
- نام‌های فارسی داروها
- راهنمای‌های فارسی

### 3. تجربه کاربری بهینه
- رابط ساده و کاربرپسند
- PWA capabilities
- Offline functionality

## Future Enhancements

### 1. AI Integration
- Machine learning for better recommendations
- Natural language processing
- Predictive analytics

### 2. Mobile App
- React Native version
- Push notifications
- Offline sync

### 3. Healthcare Integration
- EHR connectivity
- Pharmacy integration
- Doctor consultation

## Code Quality

### 1. TypeScript
- Strong typing
- Interface definitions
- Type safety

### 2. Code Organization
- Modular architecture
- Separation of concerns
- Clean code principles

### 3. Documentation
- Inline comments
- API documentation
- User guides

## Conclusion

این پروژه یک سیستم جامع و علمی برای مشاوره داروهای OTC است که با استفاده از تکنولوژی‌های مدرن و رویکرد کاربرمحور طراحی شده است. سیستم قابلیت‌های پیشرفته‌ای مانند بررسی تداخلات دارویی، پیشنهاد مکمل‌های علمی، و پشتیبانی کامل از زبان فارسی را ارائه می‌دهد.

---

**تاریخ ایجاد**: ژانویه 2025  
**نسخه**: 1.0.0  
**وضعیت**: Production Ready  
**مجوز**: Private Project