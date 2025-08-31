# مهاجرت از SQLite به PostgreSQL

این راهنما مراحل مهاجرت دیتابیس پروژه OTC Recommender از SQLite به PostgreSQL را شرح می‌دهد.

## 📋 پیش‌نیازها

- Docker و Docker Compose نصب شده باشد
- Node.js 18+ نصب شده باشد
- دسترسی به terminal/PowerShell

## 🚀 مراحل مهاجرت

### 1. راه‌اندازی PostgreSQL با Docker

```bash
# شروع PostgreSQL و pgAdmin
docker-compose up -d

# بررسی وضعیت سرویس‌ها
docker-compose ps
```

**دسترسی‌ها:**
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`
  - Email: `admin@example.com`
  - Password: `admin123`

### 2. تنظیم محیط توسعه

```bash
cd backend

# کپی تنظیمات محیط توسعه
cp .env.development .env

# نصب وابستگی‌ها (در صورت نیاز)
npm install

# تولید Prisma Client
npm run prisma:generate
```

### 3. ایجاد جداول در PostgreSQL

```bash
# اجرای migration ها
npm run prisma:migrate:dev

# در صورت نیاز به reset کامل دیتابیس
npx prisma migrate reset
```

### 4. مهاجرت داده‌ها از SQLite

⚠️ **مهم:** قبل از مهاجرت، بک‌آپ از SQLite بگیرید:

```bash
# بک‌آپ خودکار در اسکریپت انجام می‌شود
# یا دستی کپی کنید:
cp prisma/dev.db prisma/dev.db.backup
```

**اجرای مهاجرت:**

```bash
# مهاجرت داده‌ها
npm run db:migrate-data
```

این اسکریپت:
- بک‌آپ خودکار از SQLite می‌گیرد
- داده‌ها را به ترتیب صحیح منتقل می‌کند
- گزارش کاملی از نتایج ارائه می‌دهد

### 5. بارگذاری داده‌های پایه (اختیاری)

```bash
# ایجاد کاربر ادمین، داروهای نمونه و محتوای آموزشی
npm run db:seed
```

### 6. تست عملکرد

```bash
# شروع سرور backend
npm run start:dev

# در terminal جدید، شروع frontend
cd ../frontend
npm run dev
```

**تست‌های ضروری:**
- ورود/ثبت‌نام کاربر
- محاسبه دوز دارو
- مدیریت پروفایل
- ایجاد یادآوری
- مشاهده محتوای آموزشی

## 🔧 محیط‌های مختلف

### Development
```bash
cp .env.development .env
npm run start:dev
```

### Staging
```bash
cp .env.staging .env
# تنظیم متغیرهای محیطی:
export STAGING_DB_USER="your_user"
export STAGING_DB_PASS="your_password"
export STAGING_DB_HOST="your_host"
export STAGING_DB_NAME="your_database"
export STAGING_JWT_SECRET="your_jwt_secret"

npm run prisma:migrate:deploy
npm run db:seed
npm run start:prod
```

### Production
```bash
cp .env.production .env
# تنظیم متغیرهای محیطی:
export PROD_DB_USER="your_user"
export PROD_DB_PASS="your_password"
export PROD_DB_HOST="your_host"
export PROD_DB_NAME="your_database"
export PROD_JWT_SECRET="your_jwt_secret"

npm run build
npm run prisma:migrate:deploy
npm run db:seed
npm run start:prod
```

## 💾 بک‌آپ و بازیابی

### ایجاد بک‌آپ

```bash
# بک‌آپ خودکار با اسکریپت
npm run db:backup

# یا دستی:
pg_dump -h localhost -U otc_user -d otc_dev -Fc -f backups/otc_$(date +%F).dump
```

### بازیابی از بک‌آپ

```bash
# بازیابی کامل
pg_restore -h localhost -U otc_user -d otc_dev --clean --create backups/your_backup.dump

# بازیابی بدون حذف جداول موجود
pg_restore -h localhost -U otc_user -d otc_dev backups/your_backup.dump
```

## 🛠️ اسکریپت‌های مفید

```bash
# مدیریت Prisma
npm run prisma:generate     # تولید client
npm run prisma:migrate:dev  # migration در dev
npm run prisma:migrate:deploy # migration در prod
npm run prisma:studio       # رابط گرافیکی دیتابیس

# مدیریت داده‌ها
npm run db:seed             # بارگذاری داده‌های پایه
npm run db:migrate-data     # مهاجرت از SQLite
npm run db:backup           # بک‌آپ دیتابیس
```

## 🔍 عیب‌یابی

### مشکلات رایج

**1. خطای اتصال به PostgreSQL:**
```bash
# بررسی وضعیت Docker
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs postgres

# راه‌اندازی مجدد
docker-compose restart postgres
```

**2. خطای Migration:**
```bash
# reset کامل migrations
npx prisma migrate reset

# اجرای مجدد
npm run prisma:migrate:dev
```

**3. خطای مهاجرت داده‌ها:**
```bash
# بررسی وجود فایل SQLite
ls -la prisma/dev.db

# بررسی اتصال PostgreSQL
npx prisma db pull

# اجرای مجدد با لاگ بیشتر
DEBUG=* npm run db:migrate-data
```

**4. مشکل Performance:**
```bash
# بررسی ایندکس‌ها
npx prisma db pull

# تحلیل query ها در pgAdmin
# استفاده از EXPLAIN ANALYZE
```

## 📊 مانیتورینگ

### Health Check

```bash
# بررسی سلامت دیتابیس
curl http://localhost:3001/health
```

### مشاهده آمار

```bash
# اتصال به pgAdmin: http://localhost:5050
# اضافه کردن سرور:
# Host: postgres (نام container)
# Port: 5432
# Username: otc_user
# Password: supersecret
# Database: otc_dev
```

## 🚨 نکات امنیتی

1. **تغییر رمزهای پیش‌فرض** در محیط production
2. **استفاده از SSL** در محیط‌های staging/production
3. **محدود کردن دسترسی** به پورت‌های دیتابیس
4. **بک‌آپ منظم** از دیتابیس
5. **نظارت بر لاگ‌ها** برای تشخیص نفوذ

## ✅ چک‌لیست تکمیل مهاجرت

- [ ] PostgreSQL با Docker راه‌اندازی شد
- [ ] Schema.prisma به PostgreSQL تغییر کرد
- [ ] فایل‌های .env برای محیط‌های مختلف ایجاد شدند
- [ ] Migration ها با موفقیت اجرا شدند
- [ ] داده‌ها از SQLite منتقل شدند
- [ ] داده‌های پایه (seed) بارگذاری شدند
- [ ] تست‌های عملکردی پاس شدند
- [ ] بک‌آپ و بازیابی تست شدند
- [ ] Health endpoint کار می‌کند
- [ ] Performance قابل قبول است
- [ ] مستندات به‌روزرسانی شدند

## 📞 پشتیبانی

در صورت بروز مشکل:
1. لاگ‌های Docker و application را بررسی کنید
2. از pgAdmin برای بررسی وضعیت دیتابیس استفاده کنید
3. اسکریپت‌های عیب‌یابی را اجرا کنید
4. در صورت نیاز، از بک‌آپ بازیابی کنید

---

**تاریخ آخرین به‌روزرسانی:** 2024
**نسخه:** 1.0.0