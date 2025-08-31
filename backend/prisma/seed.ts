import { PrismaClient, UserRole, Gender, MedicalConditionType, ContentCategory, ContentType, FAQCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@otc-recommender.com' },
      update: {},
      create: {
        email: 'admin@otc-recommender.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });
    
    console.log('✅ Admin user created:', adminUser.email);

    // Create sample pharmacist user
    const pharmacistPassword = await bcrypt.hash('pharmacist123', 10);
    
    const pharmacistUser = await prisma.user.upsert({
      where: { email: 'pharmacist@otc-recommender.com' },
      update: {},
      create: {
        email: 'pharmacist@otc-recommender.com',
        password: pharmacistPassword,
        role: UserRole.PHARMACIST,
      },
    });
    
    console.log('✅ Pharmacist user created:', pharmacistUser.email);

    // Create sample drugs
    const sampleDrugs = [
      {
        name_fa: 'استامینوفن',
        name_en: 'Acetaminophen',
        generic_name: 'acetaminophen',
        brand_names: JSON.stringify(['تایلنول', 'پانادول', 'آدول']),
        atc_code: 'N02BE01',
        infant_dose_mg_kg: 10.0,
        child_dose_mg_kg: 15.0,
        adult_dose_mg: 500.0,
        max_single_dose_mg: 1000.0,
        max_daily_dose_mg: 4000.0,
        min_age_months: 3,
        max_age_years: null,
        contraindications: JSON.stringify(['نارسایی کبدی شدید', 'حساسیت به استامینوفن']),
        drug_interactions: JSON.stringify(['وارفارین', 'کاربامازپین']),
        warnings: JSON.stringify(['مصرف بیش از حد می‌تواند باعث آسیب کبدی شود']),
        dosing_interval_hours: 6,
        max_doses_per_day: 4,
      },
      {
        name_fa: 'ایبوپروفن',
        name_en: 'Ibuprofen',
        generic_name: 'ibuprofen',
        brand_names: JSON.stringify(['بروفن', 'آدویل', 'نوروفن']),
        atc_code: 'M01AE01',
        infant_dose_mg_kg: 5.0,
        child_dose_mg_kg: 10.0,
        adult_dose_mg: 400.0,
        max_single_dose_mg: 800.0,
        max_daily_dose_mg: 2400.0,
        min_age_months: 6,
        max_age_years: null,
        contraindications: JSON.stringify(['زخم معده', 'نارسایی کلیوی', 'حساسیت به NSAIDها']),
        drug_interactions: JSON.stringify(['وارفارین', 'ACE inhibitors', 'لیتیوم']),
        warnings: JSON.stringify(['خطر خونریزی گوارشی', 'خطر مشکلات قلبی عروقی']),
        dosing_interval_hours: 8,
        max_doses_per_day: 3,
      },
    ];

    for (const drugData of sampleDrugs) {
      const drug = await prisma.drug.upsert({
        where: { generic_name: drugData.generic_name },
        update: {},
        create: drugData,
      });
      console.log('✅ Drug created:', drug.name_fa);
    }

    // Create sample educational content
    const sampleContent = [
      {
        title_fa: 'راهنمای استفاده از استامینوفن',
        title_en: 'Acetaminophen Usage Guide',
        content_fa: '# راهنمای استفاده از استامینوفن\n\nاستامینوفن یکی از رایج‌ترین داروهای ضد درد و تب‌بر است که بدون نسخه در دسترس قرار دارد.\n\n## نحوه مصرف\n- بزرگسالان: 500-1000 میلی‌گرم هر 6 ساعت\n- کودکان: 10-15 میلی‌گرم بر کیلوگرم وزن بدن\n\n## نکات مهم\n- حداکثر دوز روزانه: 4000 میلی‌گرم\n- با غذا یا بدون غذا قابل مصرف است\n- در صورت مشکلات کبدی مصرف نکنید',
        content_en: null,
        summary_fa: 'راهنمای کامل استفاده از استامینوفن برای کنترل درد و تب',
        summary_en: null,
        category: ContentCategory.MEDICATION_SAFETY,
        type: ContentType.GUIDE,
        slug: 'acetaminophen-usage-guide',
        tags: JSON.stringify(['استامینوفن', 'ضد درد', 'تب‌بر', 'OTC']),
        is_featured: true,
        is_published: true,
        published_by: adminUser.id,
        published_at: new Date(),
      },
    ];

    for (const contentData of sampleContent) {
      const content = await prisma.educationalContent.upsert({
        where: { slug: contentData.slug },
        update: {},
        create: contentData,
      });
      console.log('✅ Educational content created:', content.title_fa);
    }

    // Create sample FAQs
    const sampleFAQs = [
      {
        question_fa: 'آیا می‌توانم استامینوفن و ایبوپروفن را همزمان مصرف کنم؟',
        question_en: null,
        answer_fa: 'بله، استامینوفن و ایبوپروفن مکانیسم‌های متفاوتی دارند و می‌توانند همزمان مصرف شوند. اما حتماً دوز مجاز هر کدام را رعایت کنید و در صورت ادامه علائم به پزشک مراجعه کنید.',
        answer_en: null,
        category: FAQCategory.DRUG_INTERACTIONS,
        slug: 'acetaminophen-ibuprofen-together',
        tags: JSON.stringify(['استامینوفن', 'ایبوپروفن', 'تداخل دارویی']),
        is_featured: true,
        is_published: true,
        published_by: adminUser.id,
      },
      {
        question_fa: 'چه زمانی باید مصرف داروهای بدون نسخه را متوقف کنم؟',
        question_en: null,
        answer_fa: 'اگر علائم بعد از 3 روز بهبود نیافت، تب بالای 39 درجه داشتید، علائم جدید ظاهر شد، یا عوارض جانبی مشاهده کردید، فوراً مصرف دارو را متوقف کرده و به پزشک مراجعه کنید.',
        answer_en: null,
        category: FAQCategory.SAFETY,
        slug: 'when-to-stop-otc-medications',
        tags: JSON.stringify(['ایمنی', 'عوارض جانبی', 'مراجعه به پزشک']),
        is_featured: true,
        is_published: true,
        published_by: adminUser.id,
      },
    ];

    for (const faqData of sampleFAQs) {
      const faq = await prisma.fAQ.upsert({
        where: { slug: faqData.slug },
        update: {},
        create: faqData,
      });
      console.log('✅ FAQ created:', faq.question_fa.substring(0, 50) + '...');
    }

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });