# راهنمای دیپلوی PWA و Service Worker

## نحوه عملکرد Service Worker

### محیط Development
- Service Worker در محیط development غیرفعال است
- تمام SW های قبلی به طور خودکار از ثبت خارج می‌شوند
- این کار مانع از مشکلات کش در حین توسعه می‌شود

### محیط Production
- Service Worker فقط در production فعال می‌شود
- از `skipWaiting()` و `clientsClaim()` برای فعال‌سازی فوری استفاده می‌کند
- Navigation requests از network-first strategy استفاده می‌کنند
- سایر منابع از cache-first با fallback به network استفاده می‌کنند

## نسخه‌گذاری کش

### افزایش VERSION هنگام دیپلوی

1. **روش دستی:**
   - فایل `public/sw.js` را باز کنید
   - خط `const VERSION = "v2025-08-29-01";` را پیدا کنید
   - تاریخ و شماره نسخه را به‌روزرسانی کنید

2. **روش خودکار:**
   ```bash
   npm run pwa:bump
   ```
   این دستور به طور خودکار VERSION را با تاریخ امروز به‌روزرسانی می‌کند

### چرا نسخه‌گذاری مهم است؟
- هر نسخه جدید کش‌های قدیمی را پاک می‌کند
- اطمینان از لود نسخه جدید UI بعد از دیپلوی
- جلوگیری از مشکلات کش قدیمی

## الگوی Back با Fallback

### مشکل
- `history.back()` گاهی به طراحی‌های قدیمی/کش‌شده برمی‌گردد
- ممکن است کاربر history کوتاهی داشته باشد

### راه‌حل‌های پیاده‌سازی شده

1. **لینک صریح (ترجیحی):**
   ```tsx
   import Link from "next/link";
   import { Button } from "@/components/ui/button";
   
   export function BackToHome() {
     return (
       <Link href="/">
         <Button variant="outline" size="sm">بازگشت</Button>
       </Link>
     );
   }
   ```

2. **Back با fallback:**
   ```tsx
   "use client";
   import { useRouter } from "next/navigation";
   
   export function SmartBackButton() {
     const router = useRouter();
     const handleBack = () => {
       if (typeof window !== "undefined" && window.history.length > 1) {
         router.back();
       } else {
         router.push("/");
       }
     };
     return <button onClick={handleBack}>بازگشت</button>;
   }
   ```

## چک‌لیست دیپلوی

### قبل از دیپلوی
- [ ] VERSION در `public/sw.js` را افزایش دهید
- [ ] تست کنید که navigation به درستی کار می‌کند
- [ ] Build production را تست کنید

### بعد از دیپلوی
- [ ] تست کنید که نسخه جدید UI بدون رفرش دستی لود می‌شود
- [ ] دکمه‌های back را تست کنید
- [ ] روی Android Chrome و iOS Safari تست کنید

## عیب‌یابی

### اگر نسخه جدید لود نمی‌شود
1. VERSION در sw.js را چک کنید
2. Developer Tools > Application > Service Workers را بررسی کنید
3. "Update on reload" را فعال کنید
4. کش مرورگر را پاک کنید

### اگر back درست کار نمی‌کند
1. Console را برای خطاهای JavaScript چک کنید
2. Network tab را برای درخواست‌های ناموفق بررسی کنید
3. از لینک‌های صریح به جای history.back() استفاده کنید