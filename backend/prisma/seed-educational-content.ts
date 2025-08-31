import { PrismaClient, FAQCategory, ContentCategory, ContentType } from '@prisma/client';

const prisma = new PrismaClient();

const faqsData = [
  {
    question_fa: 'چگونه دوز صحیح دارو را محاسبه کنم؟',
    answer_fa: 'دوز دارو بر اساس سن، وزن و نوع دارو محاسبه می‌شود. از محاسبه‌گر دوز سایت استفاده کنید یا با داروساز مشورت کنید.',
    category: FAQCategory.DOSAGE,
    slug: 'how-to-calculate-correct-dose',
    is_featured: true,
  },
  {
    question_fa: 'آیا می‌توانم دو دارو را همزمان مصرف کنم؟',
    answer_fa: 'برخی داروها ممکن است با یکدیگر تداخل داشته باشند. قبل از مصرف همزمان داروها، حتماً با داروساز یا پزشک مشورت کنید.',
    category: FAQCategory.DRUG_INTERACTIONS,
    slug: 'can-i-take-two-drugs-together',
    is_featured: true,
  },
  {
    question_fa: 'عوارض جانبی داروها چیست؟',
    answer_fa: 'عوارض جانبی شامل تهوع، سردرد، خواب‌آلودگی یا واکنش‌های آلرژیک می‌شود. در صورت بروز عوارض شدید، فوراً با پزشک تماس بگیرید.',
    category: FAQCategory.SIDE_EFFECTS,
    slug: 'what-are-drug-side-effects',
    is_featured: false,
  },
  {
    question_fa: 'آیا داروهای OTC برای کودکان ایمن هستند؟',
    answer_fa: 'برخی داروهای OTC برای کودکان مناسب نیستند. همیشه دوز مخصوص کودکان را رعایت کنید و در صورت تردید با پزشک مشورت کنید.',
    category: FAQCategory.CHILDREN,
    slug: 'are-otc-drugs-safe-for-children',
    is_featured: true,
  },
  {
    question_fa: 'چه زمانی باید مصرف دارو را متوقف کنم؟',
    answer_fa: 'اگر علائم بهبود یافت یا عوارض جانبی شدیدی مشاهده کردید، مصرف دارو را متوقف کنید. برای داروهای تجویزی، دوره کامل درمان را طی کنید.',
    category: FAQCategory.GENERAL,
    slug: 'when-to-stop-medication',
    is_featured: false,
  },
  {
    question_fa: 'آیا می‌توانم در دوران بارداری دارو مصرف کنم؟',
    answer_fa: 'بسیاری از داروها در دوران بارداری ممنوع هستند. قبل از مصرف هر دارویی، حتماً با پزشک زنان مشورت کنید.',
    category: FAQCategory.PREGNANCY,
    slug: 'medication-during-pregnancy',
    is_featured: true,
  },
  {
    question_fa: 'چگونه داروها را نگهداری کنم؟',
    answer_fa: 'داروها را در جای خشک، خنک و دور از نور مستقیم نگهداری کنید. از قرار دادن در یخچال یا حمام خودداری کنید مگر اینکه روی بسته‌بندی ذکر شده باشد.',
    category: FAQCategory.SAFETY,
    slug: 'how-to-store-medications',
    is_featured: false,
  },
  {
    question_fa: 'در صورت مسمومیت دارویی چه کار کنم؟',
    answer_fa: 'فوراً با مرکز اطلاعات سموم (125) تماس بگیرید یا به اورژانس مراجعه کنید. بسته‌بندی دارو را همراه داشته باشید.',
    category: FAQCategory.EMERGENCY,
    slug: 'what-to-do-in-drug-poisoning',
    is_featured: true,
  },
];

const educationalContentData = [
  {
    title_fa: 'راهنمای کامل مصرف ایمن داروهای ضد درد',
    content_fa: `# راهنمای کامل مصرف ایمن داروهای ضد درد

## مقدمه
داروهای ضد درد از پرمصرف‌ترین داروهای خانگی هستند. استفاده صحیح از این داروها می‌تواند درد شما را کاهش دهد بدون اینکه عوارض جانبی ایجاد کند.

## انواع داروهای ضد درد

### استامینوفن (پاراستامول)
- مناسب برای درد خفیف تا متوسط
- کمترین عوارض جانبی
- ایمن برای کودکان و بارداری

### ایبوپروفن
- ضد التهاب و ضد درد
- مناسب برای دردهای عضلانی
- با غذا مصرف شود

## نکات ایمنی
1. هرگز از حداکثر دوز روزانه تجاوز نکنید
2. با الکل مصرف نکنید
3. در صورت بیماری کلیوی احتیاط کنید
4. علائم آلرژی را جدی بگیرید

## نتیجه‌گیری
مصرف آگاهانه داروهای ضد درد می‌تواند کیفیت زندگی شما را بهبود بخشد. در صورت تردید با داروساز مشورت کنید.`,
    summary_fa: 'راهنمای جامع برای استفاده ایمن از داروهای ضد درد شامل انواع، دوز و نکات ایمنی',
    category: ContentCategory.MEDICATION_SAFETY,
    type: ContentType.GUIDE,
    slug: 'safe-use-of-pain-medications',
    is_featured: true,
  },
  {
    title_fa: 'بیماری‌های شایع زمستان و درمان آنها',
    content_fa: `# بیماری‌های شایع زمستان و درمان آنها

## سرماخوردگی
سرماخوردگی شایع‌ترین بیماری زمستان است که معمولاً خودبخود بهبود می‌یابد.

### علائم:
- آبریزش بینی
- عطسه
- گلودرد خفیف
- خستگی

### درمان:
- استراحت کافی
- مصرف مایعات گرم
- استامینوفن برای تب
- قطره نمکی بینی

## آنفولانزا
آنفولانزا شدیدتر از سرماخوردگی است و نیاز به مراقبت بیشتری دارد.

### علائم:
- تب بالا
- لرز
- درد عضلات
- سردرد شدید

### درمان:
- استراحت مطلق
- مصرف مایعات فراوان
- داروهای ضد تب
- در صورت تشدید علائم به پزشک مراجعه کنید

## پیشگیری
1. واکسیناسیون سالانه آنفولانزا
2. شستن مکرر دست‌ها
3. اجتناب از تماس با افراد بیمار
4. تقویت سیستم ایمنی با تغذیه سالم`,
    summary_fa: 'راهنمای تشخیص و درمان بیماری‌های شایع زمستان مانند سرماخوردگی و آنفولانزا',
    category: ContentCategory.COMMON_DISEASES,
    type: ContentType.ARTICLE,
    slug: 'common-winter-diseases',
    is_featured: true,
  },
  {
    title_fa: 'تداخلات دارویی: آنچه باید بدانید',
    content_fa: `# تداخلات دارویی: آنچه باید بدانید

## تعریف تداخل دارویی
تداخل دارویی زمانی رخ می‌دهد که یک دارو بر اثر دارو یا عوارض دارو دیگری تأثیر بگذارد.

## انواع تداخلات

### تداخل دارو-دارو
- مصرف همزمان دو یا چند دارو
- ممکن است اثر داروها را کاهش یا افزایش دهد
- گاهی عوارض جدیدی ایجاد می‌کند

### تداخل دارو-غذا
- برخی غذاها جذب دارو را تغییر می‌دهند
- مثال: کلسیم با آنتی‌بیوتیک‌ها

### تداخل دارو-بیماری
- برخی داروها در حضور بیماری‌های خاص خطرناک هستند
- مثال: آسپرین در کودکان مبتلا به آنفولانزا

## نحوه پیشگیری
1. لیست کاملی از داروهای مصرفی تهیه کنید
2. با داروساز در مورد تداخلات مشورت کنید
3. دستورات مصرف را دقیقاً رعایت کنید
4. تغییرات در وضعیت سلامتی را گزارش دهید

## علائم هشدار
- تغییر ناگهانی در اثر دارو
- بروز عوارض جدید
- تشدید عوارض موجود
- علائم آلرژیک`,
    summary_fa: 'اطلاعات کامل در مورد تداخلات دارویی، انواع آن و راه‌های پیشگیری',
    category: ContentCategory.DRUG_INTERACTIONS,
    type: ContentType.ARTICLE,
    slug: 'drug-interactions-guide',
    is_featured: false,
  },
  {
    title_fa: 'چک‌لیست ایمنی دارو برای خانواده',
    content_fa: `# چک‌لیست ایمنی دارو برای خانواده

## قبل از مصرف دارو
- [ ] تاریخ انقضا را بررسی کنید
- [ ] دوز صحیح را محاسبه کنید
- [ ] تداخلات دارویی را بررسی کنید
- [ ] آلرژی‌های احتمالی را در نظر بگیرید

## هنگام مصرف دارو
- [ ] دستورات روی بسته‌بندی را بخوانید
- [ ] با آب کافی مصرف کنید
- [ ] زمان‌بندی مصرف را رعایت کنید
- [ ] دوز را دقیق اندازه‌گیری کنید

## نگهداری داروها
- [ ] در جای خشک و خنک نگهداری کنید
- [ ] از دسترس کودکان دور نگه دارید
- [ ] در بسته‌بندی اصلی نگهداری کنید
- [ ] داروهای منقضی را دور بیندازید

## برای کودکان
- [ ] از فرمولاسیون مخصوص کودک استفاده کنید
- [ ] وزن کودک را دقیق اندازه‌گیری کنید
- [ ] از ابزار اندازه‌گیری مناسب استفاده کنید
- [ ] هرگز دارو را با شیر یا آب میوه مخلوط نکنید

## در صورت اورژانس
- [ ] شماره مرکز سموم را در دسترس داشته باشید: 125
- [ ] لیست داروهای مصرفی را به‌روز نگه دارید
- [ ] در سفر، داروهای ضروری را همراه داشته باشید`,
    summary_fa: 'چک‌لیست جامع برای استفاده ایمن از داروها در خانواده',
    category: ContentCategory.MEDICATION_SAFETY,
    type: ContentType.CHECKLIST,
    slug: 'family-medication-safety-checklist',
    is_featured: true,
  },
];

async function seedEducationalContent() {
  console.log('🌱 Seeding educational content...');

  // Clear existing content
  await prisma.fAQ.deleteMany({});
  await prisma.educationalContent.deleteMany({});

  // Create FAQs
  for (const faq of faqsData) {
    await prisma.fAQ.create({
      data: faq,
    });
  }

  // Create Educational Content
  for (const content of educationalContentData) {
    await prisma.educationalContent.create({
      data: content,
    });
  }

  console.log(`✅ Seeded ${faqsData.length} FAQs successfully!`);
  console.log(`✅ Seeded ${educationalContentData.length} educational articles successfully!`);
  console.log('🎉 Educational content seeding completed!');
}

if (require.main === module) {
  seedEducationalContent()
    .catch((e) => {
      console.error('❌ Error seeding educational content:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedEducationalContent };