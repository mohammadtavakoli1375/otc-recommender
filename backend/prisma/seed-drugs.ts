import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const drugsData = [
  {
    name_fa: 'استامینوفن',
    name_en: 'Acetaminophen',
    generic_name: 'Paracetamol',
    brand_names: JSON.stringify(['تایلنول', 'پانادول', 'آدول', 'سیتامول']),
    atc_code: 'N02BE01',
    infant_dose_mg_kg: 10, // 10-15 mg/kg every 4-6 hours
    child_dose_mg_kg: 10,  // 10-15 mg/kg every 4-6 hours
    adult_dose_mg: 500,    // 500-1000mg every 4-6 hours
    max_single_dose_mg: 1000,
    max_daily_dose_mg: 3000, // Updated to match OTC guidelines
    min_age_months: 3,     // Age min 3 months
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به استامینوفن', 'نارسایی کبدی شدید', 'مصرف الکل سنگین']),
    drug_interactions: JSON.stringify(['وارفارین', 'الکل']),
    warnings: JSON.stringify(['خطر آسیب کبدی با دوز بالا', 'احتیاط در مصرف الکل', 'بررسی مجموع دوز از همه محصولات ترکیبی']),
    dosing_interval_hours: 6,
    max_doses_per_day: 4,
  },
  {
    name_fa: 'ایبوپروفن',
    name_en: 'Ibuprofen',
    generic_name: 'Ibuprofen',
    brand_names: JSON.stringify(['بروفن', 'آدویل', 'نوروفن']),
    atc_code: 'M01AE01',
    infant_dose_mg_kg: 5,  // 5-10 mg/kg every 6-8 hours
    child_dose_mg_kg: 7,   // 5-10 mg/kg every 6-8 hours
    adult_dose_mg: 400,    // 200-400mg every 6-8 hours
    max_single_dose_mg: 800,
    max_daily_dose_mg: 1200, // Updated to match OTC guidelines
    min_age_months: 6,     // Not recommended under 6 months
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به NSAIDs', 'زخم معده فعال', 'نارسایی کلیوی شدید', 'بارداری ≥20 هفته']),
    drug_interactions: JSON.stringify(['وارفارین', 'ACE inhibitors', 'لیتیم', 'متوترکسات', 'آسپرین']),
    warnings: JSON.stringify(['خطر خونریزی گوارشی', 'احتیاط در آسم', 'مصرف با غذا', 'ممنوع در سه‌ماهه سوم بارداری']),
    dosing_interval_hours: 8,
    max_doses_per_day: 3,
  },
  {
    name_fa: 'آسپرین',
    name_en: 'Aspirin',
    generic_name: 'Aspirin',
    brand_names: JSON.stringify(['آسپرین', 'آسپرو', 'بایر']),
    atc_code: 'N02BA01',
    infant_dose_mg_kg: null, // Not recommended under 16 years (Reye's syndrome)
    child_dose_mg_kg: null,  // Not recommended under 16 years
    adult_dose_mg: 500,      // 325-650mg every 4 hours
    max_single_dose_mg: 1000,
    max_daily_dose_mg: 4000,
    min_age_months: 192,     // 16 years minimum
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به آسپرین', 'زخم معده فعال', 'اختلالات انعقادی', 'کودکان زیر 16 سال']),
    drug_interactions: JSON.stringify(['وارفارین', 'متوترکسات', 'ACE inhibitors', 'الکل']),
    warnings: JSON.stringify(['خطر سندرم رای در کودکان', 'خطر خونریزی', 'مصرف با غذا']),
    dosing_interval_hours: 4,
    max_doses_per_day: 6,
  },
  {
    name_fa: 'لوراتادین',
    name_en: 'Loratadine',
    generic_name: 'Loratadine',
    brand_names: JSON.stringify(['کلاریتین', 'لوراتاب', 'آلرژیکس']),
    atc_code: 'R06AX13',
    infant_dose_mg_kg: null, // Not recommended under 2 years
    child_dose_mg_kg: 0.2,   // 0.2 mg/kg once daily
    adult_dose_mg: 10,       // 10mg once daily
    max_single_dose_mg: 10,
    max_daily_dose_mg: 10,
    min_age_months: 24,      // Not recommended under 2 years
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به لوراتادین']),
    drug_interactions: JSON.stringify(['کتوکونازول', 'اریترومایسین', 'سیمتیدین']),
    warnings: JSON.stringify(['خواب‌آلودگی نادر', 'احتیاط در نارسایی کبدی']),
    dosing_interval_hours: 24,
    max_doses_per_day: 1,
  },
  {
    name_fa: 'سیتریزین',
    name_en: 'Cetirizine',
    generic_name: 'Cetirizine',
    brand_names: JSON.stringify(['زیرتک', 'آلرسین', 'سیتریزین']),
    atc_code: 'R06AE07',
    infant_dose_mg_kg: null, // Not recommended under 6 months
    child_dose_mg_kg: 0.25,  // 0.25 mg/kg once daily
    adult_dose_mg: 10,       // 5-10mg once daily
    max_single_dose_mg: 10,
    max_daily_dose_mg: 10,
    min_age_months: 6,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به سیتریزین', 'نارسایی شدید کلیه']),
    drug_interactions: JSON.stringify(['تئوفیلین', 'ریتوناویر']),
    warnings: JSON.stringify(['خواب‌آلودگی', 'احتیاط در رانندگی', 'کاهش دوز در نارسایی کلیه']),
    dosing_interval_hours: 24,
    max_doses_per_day: 1,
  },
  {
    name_fa: 'دیفن‌هیدرامین',
    name_en: 'Diphenhydramine',
    generic_name: 'Diphenhydramine',
    brand_names: JSON.stringify(['بنادریل', 'دیفن‌هیدرامین']),
    atc_code: 'R06AA02',
    infant_dose_mg_kg: null, // Not recommended under 2 years
    child_dose_mg_kg: 1,     // 1 mg/kg every 6 hours
    adult_dose_mg: 25,       // 25-50mg every 4-6 hours
    max_single_dose_mg: 50,
    max_daily_dose_mg: 300,
    min_age_months: 24,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به دیفن‌هیدرامین', 'آسم حاد', 'گلوکوم زاویه بسته']),
    drug_interactions: JSON.stringify(['MAO inhibitors', 'آنتی‌کولینرژیک‌ها', 'الکل']),
    warnings: JSON.stringify(['خواب‌آلودگی شدید', 'احتیاط در سالمندان', 'ممنوع در رانندگی']),
    dosing_interval_hours: 6,
    max_doses_per_day: 4,
  },
  {
    name_fa: 'اومپرازول',
    name_en: 'Omeprazole',
    generic_name: 'Omeprazole',
    brand_names: JSON.stringify(['لوسک', 'اومپرال', 'گاسترولوک']),
    atc_code: 'A02BC01',
    infant_dose_mg_kg: 1,    // 1-2 mg/kg once daily
    child_dose_mg_kg: 1,     // 1-2 mg/kg once daily
    adult_dose_mg: 20,       // 20-40mg once daily
    max_single_dose_mg: 40,
    max_daily_dose_mg: 40,
    min_age_months: 1,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به اومپرازول', 'مصرف همزمان نلفیناویر']),
    drug_interactions: JSON.stringify(['کلوپیدوگرل', 'وارفارین', 'دیگوکسین', 'آتازاناویر']),
    warnings: JSON.stringify(['خطر کمبود ویتامین B12', 'خطر عفونت C. difficile', 'احتیاط در مصرف طولانی‌مدت']),
    dosing_interval_hours: 24,
    max_doses_per_day: 1,
  },
  {
    name_fa: 'فامتیدین',
    name_en: 'Famotidine',
    generic_name: 'Famotidine',
    brand_names: JSON.stringify(['پپسید', 'فامتیدین', 'گاسترودین']),
    atc_code: 'A02BA03',
    infant_dose_mg_kg: null, // Not recommended under 1 year
    child_dose_mg_kg: 0.5,   // 0.5 mg/kg twice daily
    adult_dose_mg: 20,       // 10-20mg twice daily
    max_single_dose_mg: 40,
    max_daily_dose_mg: 80,
    min_age_months: 12,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به فامتیدین', 'نارسایی شدید کلیه']),
    drug_interactions: JSON.stringify(['کتوکونازول', 'آتازاناویر']),
    warnings: JSON.stringify(['کاهش دوز در نارسایی کلیه', 'احتیاط در سالمندان']),
    dosing_interval_hours: 12,
    max_doses_per_day: 2,
  },
  {
    name_fa: 'سیمتیکون',
    name_en: 'Simethicone',
    generic_name: 'Simethicone',
    brand_names: JSON.stringify(['گاس-ایکس', 'مایلیکون', 'ضدنفخ']),
    atc_code: 'A03AX13',
    infant_dose_mg_kg: 1,    // 1-2 mg/kg after meals
    child_dose_mg_kg: 1,     // 1-2 mg/kg after meals
    adult_dose_mg: 40,       // 40-125mg after meals
    max_single_dose_mg: 125,
    max_daily_dose_mg: 500,
    min_age_months: 0,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به سیمتیکون']),
    drug_interactions: JSON.stringify([]),
    warnings: JSON.stringify(['بعد از غذا مصرف شود', 'برای همه سنین ایمن']),
    dosing_interval_hours: 6,
    max_doses_per_day: 4,
  },
  {
    name_fa: 'لوپرامید',
    name_en: 'Loperamide',
    generic_name: 'Loperamide',
    brand_names: JSON.stringify(['ایمودیوم', 'لوپرامید', 'ضداسهال']),
    atc_code: 'A07DA03',
    infant_dose_mg_kg: null, // Not recommended under 2 years
    child_dose_mg_kg: 0.1,   // 0.1 mg/kg after each loose stool
    adult_dose_mg: 4,        // 4mg initially, then 2mg after each loose stool
    max_single_dose_mg: 4,
    max_daily_dose_mg: 16,
    min_age_months: 24,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به لوپرامید', 'اسهال خونی', 'تب همراه اسهال', 'کولیت اولسراتیو']),
    drug_interactions: JSON.stringify(['ریتوناویر', 'کینیدین']),
    warnings: JSON.stringify(['ممنوع در اسهال عفونی', 'احتیاط در کودکان', 'مایعات فراوان بنوشید']),
    dosing_interval_hours: 0, // As needed after each loose stool
    max_doses_per_day: 8,
  },
  {
    name_fa: 'دکسترومتورفان',
    name_en: 'Dextromethorphan',
    generic_name: 'Dextromethorphan',
    brand_names: JSON.stringify(['روبیتوسین', 'دلسیم', 'شربت سرفه']),
    atc_code: 'R05DA09',
    infant_dose_mg_kg: null, // Not recommended under 2 years
    child_dose_mg_kg: 0.5,   // 0.5-1 mg/kg every 6-8 hours
    adult_dose_mg: 15,       // 15-30mg every 4-8 hours
    max_single_dose_mg: 30,
    max_daily_dose_mg: 120,
    min_age_months: 24,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به دکسترومتورفان', 'مصرف همزمان MAO inhibitors']),
    drug_interactions: JSON.stringify(['MAO inhibitors', 'SSRIs', 'فلووکسامین']),
    warnings: JSON.stringify(['احتیاط در کودکان زیر 6 سال', 'ممنوع در سرفه خلط‌دار']),
    dosing_interval_hours: 6,
    max_doses_per_day: 4,
  },
  {
    name_fa: 'گوایفنزین',
    name_en: 'Guaifenesin',
    generic_name: 'Guaifenesin',
    brand_names: JSON.stringify(['موسینکس', 'روبیتوسین', 'شربت خلط‌آور']),
    atc_code: 'R05CA03',
    infant_dose_mg_kg: null, // Not recommended under 2 years
    child_dose_mg_kg: 2,     // 2-4 mg/kg every 4 hours
    adult_dose_mg: 200,      // 200-400mg every 4 hours
    max_single_dose_mg: 400,
    max_daily_dose_mg: 2400,
    min_age_months: 24,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به گوایفنزین']),
    drug_interactions: JSON.stringify([]),
    warnings: JSON.stringify(['مایعات فراوان بنوشید', 'احتیاط در کودکان زیر 6 سال']),
    dosing_interval_hours: 4,
    max_doses_per_day: 6,
  },
  {
    name_fa: 'بیسموت ساب‌سالیسیلات',
    name_en: 'Bismuth Subsalicylate',
    generic_name: 'Bismuth Subsalicylate',
    brand_names: JSON.stringify(['پپتو-بیسمول', 'بیسموت']),
    atc_code: 'A07XA12',
    infant_dose_mg_kg: null, // Not recommended under 12 years
    child_dose_mg_kg: null,  // Not recommended under 12 years
    adult_dose_mg: 525,      // 525mg every 30 minutes to 1 hour
    max_single_dose_mg: 525,
    max_daily_dose_mg: 4200,
    min_age_months: 144,     // 12 years minimum
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به آسپرین', 'کودکان زیر 12 سال', 'سندرم رای']),
    drug_interactions: JSON.stringify(['وارفارین', 'آسپرین', 'متوترکسات']),
    warnings: JSON.stringify(['ممکن است زبان و مدفوع را سیاه کند', 'احتیاط در نارسایی کلیه']),
    dosing_interval_hours: 1,
    max_doses_per_day: 8,
  },
  {
    name_fa: 'لاکتولوز',
    name_en: 'Lactulose',
    generic_name: 'Lactulose',
    brand_names: JSON.stringify(['دوفالاک', 'لاکتولوز']),
    atc_code: 'A06AD11',
    infant_dose_mg_kg: null, // Not recommended under 1 year
    child_dose_mg_kg: 1,     // 1-3 ml/kg daily
    adult_dose_mg: 15,       // 15-30ml daily (equivalent to 10-20g)
    max_single_dose_mg: 30,
    max_daily_dose_mg: 60,
    min_age_months: 12,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به لاکتولوز', 'انسداد روده', 'گالاکتوزمی']),
    drug_interactions: JSON.stringify([]),
    warnings: JSON.stringify(['ممکن است نفخ و گاز ایجاد کند', 'مایعات فراوان بنوشید']),
    dosing_interval_hours: 24,
    max_doses_per_day: 1,
  },
  {
    name_fa: 'سنا',
    name_en: 'Senna',
    generic_name: 'Senna',
    brand_names: JSON.stringify(['سناکوت', 'سنا']),
    atc_code: 'A06AB06',
    infant_dose_mg_kg: null, // Not recommended under 2 years
    child_dose_mg_kg: 0.5,   // 0.5-1 mg/kg at bedtime
    adult_dose_mg: 15,       // 15-30mg at bedtime
    max_single_dose_mg: 30,
    max_daily_dose_mg: 30,
    min_age_months: 24,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به سنا', 'انسداد روده', 'التهاب روده']),
    drug_interactions: JSON.stringify(['دیگوکسین', 'دیورتیک‌ها']),
    warnings: JSON.stringify(['فقط استفاده کوتاه‌مدت', 'ممکن است درد شکم ایجاد کند']),
    dosing_interval_hours: 24,
    max_doses_per_day: 1,
  },
  {
    name_fa: 'ملاتونین',
    name_en: 'Melatonin',
    generic_name: 'Melatonin',
    brand_names: JSON.stringify(['ملاتونین', 'سرکادین']),
    atc_code: 'N05CH01',
    infant_dose_mg_kg: null, // Not recommended under 3 years
    child_dose_mg_kg: 0.05,  // 0.05-0.15 mg/kg 30-60 minutes before bedtime
    adult_dose_mg: 3,        // 1-5mg 30-60 minutes before bedtime
    max_single_dose_mg: 10,
    max_daily_dose_mg: 10,
    min_age_months: 36,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به ملاتونین', 'بیماری‌های خودایمنی']),
    drug_interactions: JSON.stringify(['وارفارین', 'ضدتشنج‌ها', 'ایمونوساپرسیو‌ها']),
    warnings: JSON.stringify(['خواب‌آلودگی روز بعد', 'احتیاط در رانندگی', 'استفاده کوتاه‌مدت']),
    dosing_interval_hours: 24,
    max_doses_per_day: 1,
  },
  {
    name_fa: 'آموکسی‌سیلین',
    name_en: 'Amoxicillin',
    generic_name: 'Amoxicillin',
    brand_names: JSON.stringify(['آموکسیل', 'هیموکس', 'کلاموکس']),
    atc_code: 'J01CA04',
    infant_dose_mg_kg: 20,   // 20-40 mg/kg/day divided every 8 hours
    child_dose_mg_kg: 25,    // 25-45 mg/kg/day divided every 8-12 hours
    adult_dose_mg: 500,      // 250-500mg every 8 hours or 500-875mg every 12 hours
    max_single_dose_mg: 875,
    max_daily_dose_mg: 3000,
    min_age_months: 0,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به پنی‌سیلین', 'مونونوکلئوز عفونی']),
    drug_interactions: JSON.stringify(['متوترکسات', 'وارفارین', 'آلوپورینول', 'قرص‌های ضدبارداری']),
    warnings: JSON.stringify(['خطر واکنش آلرژیک شدید', 'اسهال مرتبط با آنتی‌بیوتیک', 'تکمیل دوره درمان ضروری']),
    dosing_interval_hours: 8,
    max_doses_per_day: 3,
  },
  {
    name_fa: 'سفکسیم',
    name_en: 'Cefixime',
    generic_name: 'Cefixime',
    brand_names: JSON.stringify(['سوپراکس', 'سفکسیم', 'فیکسیم']),
    atc_code: 'J01DD08',
    infant_dose_mg_kg: 4,    // 4 mg/kg twice daily or 8 mg/kg once daily
    child_dose_mg_kg: 4,     // 4 mg/kg twice daily or 8 mg/kg once daily
    adult_dose_mg: 200,      // 200mg twice daily or 400mg once daily
    max_single_dose_mg: 400,
    max_daily_dose_mg: 400,
    min_age_months: 6,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به سفالوسپورین‌ها', 'حساسیت شدید به پنی‌سیلین']),
    drug_interactions: JSON.stringify(['وارفارین', 'پروبنسید']),
    warnings: JSON.stringify(['خطر واکنش آلرژیک متقابل با پنی‌سیلین', 'اسهال مرتبط با آنتی‌بیوتیک', 'تکمیل دوره درمان']),
    dosing_interval_hours: 12,
    max_doses_per_day: 2,
  },
  {
    name_fa: 'آموکسی‌کلاو',
    name_en: 'Amoxicillin-Clavulanate',
    generic_name: 'Amoxicillin-Clavulanic Acid',
    brand_names: JSON.stringify(['آگمنتین', 'کلاوکس', 'آموکسی‌کلاو']),
    atc_code: 'J01CR02',
    infant_dose_mg_kg: 20,   // 20-40 mg/kg/day (amoxicillin component) divided every 8 hours
    child_dose_mg_kg: 25,    // 25-45 mg/kg/day (amoxicillin component) divided every 8-12 hours
    adult_dose_mg: 500,      // 500/125mg every 8 hours or 875/125mg every 12 hours
    max_single_dose_mg: 875,
    max_daily_dose_mg: 2625, // Based on amoxicillin component
    min_age_months: 0,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به پنی‌سیلین', 'سابقه یرقان کولستاتیک با آموکسی‌کلاو', 'مونونوکلئوز']),
    drug_interactions: JSON.stringify(['وارفارین', 'آلوپورینول', 'متوترکسات', 'قرص‌های ضدبارداری']),
    warnings: JSON.stringify(['خطر اسهال بیشتر از آموکسی‌سیلین ساده', 'مصرف با غذا برای کاهش عوارض گوارشی', 'تکمیل دوره درمان']),
    dosing_interval_hours: 8,
    max_doses_per_day: 3,
  },
  {
    name_fa: 'مترونیدازول',
    name_en: 'Metronidazole',
    generic_name: 'Metronidazole',
    brand_names: JSON.stringify(['فلاژیل', 'مترونیدازول', 'متروژل']),
    atc_code: 'J01XD01',
    infant_dose_mg_kg: 7.5,  // 7.5 mg/kg every 8 hours
    child_dose_mg_kg: 7.5,   // 7.5 mg/kg every 8 hours
    adult_dose_mg: 500,      // 250-500mg every 8 hours or 400mg every 8 hours
    max_single_dose_mg: 500,
    max_daily_dose_mg: 1500,
    min_age_months: 0,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به مترونیدازول', 'مصرف الکل', 'سه‌ماهه اول بارداری']),
    drug_interactions: JSON.stringify(['وارفارین', 'دیسولفیرام', 'لیتیم', 'فنی‌توئین', 'الکل']),
    warnings: JSON.stringify(['ممنوع مصرف الکل تا 48 ساعت بعد از قطع دارو', 'ممکن است طعم فلزی ایجاد کند', 'احتیاط در بیماری‌های عصبی']),
    dosing_interval_hours: 8,
    max_doses_per_day: 3,
  },
  {
    name_fa: 'دیکلوفناک',
    name_en: 'Diclofenac',
    generic_name: 'Diclofenac',
    brand_names: JSON.stringify(['ولتارن', 'دیکلوفناک', 'کتافلام']),
    atc_code: 'M01AB05',
    infant_dose_mg_kg: null, // Not recommended under 1 year
    child_dose_mg_kg: 1,     // 1-3 mg/kg/day divided every 8-12 hours
    adult_dose_mg: 50,       // 25-50mg every 8 hours
    max_single_dose_mg: 75,
    max_daily_dose_mg: 150,
    min_age_months: 12,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به NSAIDs', 'زخم معده فعال', 'نارسایی قلبی شدید', 'بارداری سه‌ماهه سوم']),
    drug_interactions: JSON.stringify(['وارفارین', 'ACE inhibitors', 'دیورتیک‌ها', 'لیتیم', 'متوترکسات']),
    warnings: JSON.stringify(['خطر حوادث قلبی عروقی', 'خطر خونریزی گوارشی', 'مصرف با غذا', 'احتیاط در سالمندان']),
    dosing_interval_hours: 8,
    max_doses_per_day: 3,
  },
  {
    name_fa: 'آزیترومایسین',
    name_en: 'Azithromycin',
    generic_name: 'Azithromycin',
    brand_names: JSON.stringify(['زیترومکس', 'آزیترومایسین', 'زیتروسین']),
    atc_code: 'J01FA10',
    infant_dose_mg_kg: 5,    // 5-10 mg/kg once daily for 3-5 days
    child_dose_mg_kg: 5,     // 5-10 mg/kg once daily for 3-5 days
    adult_dose_mg: 500,      // 500mg once daily for 3 days or 500mg day 1, then 250mg days 2-5
    max_single_dose_mg: 500,
    max_daily_dose_mg: 500,
    min_age_months: 6,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به ماکرولیدها', 'سابقه یرقان با آزیترومایسین']),
    drug_interactions: JSON.stringify(['وارفارین', 'دیگوکسین', 'ارگوتامین', 'سیکلوسپورین']),
    warnings: JSON.stringify(['خطر آریتمی قلبی', 'احتیاط در بیماری‌های قلبی', 'مصرف ناشتا یا 2 ساعت بعد غذا']),
    dosing_interval_hours: 24,
    max_doses_per_day: 1,
  },
  {
    name_fa: 'کلاریترومایسین',
    name_en: 'Clarithromycin',
    generic_name: 'Clarithromycin',
    brand_names: JSON.stringify(['کلاسید', 'کلاریترومایسین', 'بیاکسین']),
    atc_code: 'J01FA09',
    infant_dose_mg_kg: 7.5,  // 7.5 mg/kg twice daily
    child_dose_mg_kg: 7.5,   // 7.5 mg/kg twice daily
    adult_dose_mg: 250,      // 250-500mg twice daily
    max_single_dose_mg: 500,
    max_daily_dose_mg: 1000,
    min_age_months: 6,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به ماکرولیدها', 'مصرف همزمان پیموزید یا ترفنادین']),
    drug_interactions: JSON.stringify(['وارفارین', 'دیگوکسین', 'تئوفیلین', 'کاربامازپین', 'استاتین‌ها']),
    warnings: JSON.stringify(['خطر آریتمی قلبی', 'تداخلات دارویی متعدد', 'مصرف با غذا برای کاهش عوارض گوارشی']),
    dosing_interval_hours: 12,
    max_doses_per_day: 2,
  },
  {
    name_fa: 'پردنیزولون',
    name_en: 'Prednisolone',
    generic_name: 'Prednisolone',
    brand_names: JSON.stringify(['پردنیزولون', 'پردنیزول', 'دلتاکورتریل']),
    atc_code: 'H02AB06',
    infant_dose_mg_kg: 1,    // 1-2 mg/kg/day divided every 6-12 hours
    child_dose_mg_kg: 1,     // 1-2 mg/kg/day divided every 6-12 hours
    adult_dose_mg: 5,        // 5-60mg daily depending on condition
    max_single_dose_mg: 80,
    max_daily_dose_mg: 80,
    min_age_months: 0,
    max_age_years: null,
    contraindications: JSON.stringify(['عفونت‌های سیستمیک فعال', 'واکسیناسیون با واکسن زنده', 'حساسیت به کورتیکواستروئیدها']),
    drug_interactions: JSON.stringify(['وارفارین', 'دیگوکسین', 'دیورتیک‌ها', 'NSAIDs', 'واکسن‌های زنده']),
    warnings: JSON.stringify(['قطع تدریجی ضروری', 'خطر سرکوب سیستم ایمنی', 'احتیاط در دیابت و فشار خون', 'مصرف با غذا']),
    dosing_interval_hours: 12,
    max_doses_per_day: 2,
  },
  {
    name_fa: 'کتورولاک',
    name_en: 'Ketorolac',
    generic_name: 'Ketorolac',
    brand_names: JSON.stringify(['کتورولاک', 'توراد', 'کتولاک']),
    atc_code: 'M01AB15',
    infant_dose_mg_kg: null, // Not recommended under 2 years
    child_dose_mg_kg: 0.5,   // 0.5 mg/kg every 6 hours (maximum 5 days)
    adult_dose_mg: 10,       // 10mg every 4-6 hours (maximum 5 days)
    max_single_dose_mg: 30,
    max_daily_dose_mg: 40,   // Oral: 40mg/day, maximum 5 days
    min_age_months: 24,
    max_age_years: null,
    contraindications: JSON.stringify(['حساسیت به NSAIDs', 'زخم معده فعال', 'نارسایی کلیوی', 'خونریزی فعال', 'بارداری و شیردهی']),
    drug_interactions: JSON.stringify(['وارفارین', 'ACE inhibitors', 'دیورتیک‌ها', 'لیتیم', 'متوترکسات']),
    warnings: JSON.stringify(['حداکثر 5 روز مصرف', 'خطر بالای خونریزی گوارشی', 'خطر نارسایی کلیوی', 'ممنوع در سالمندان بالای 65 سال']),
    dosing_interval_hours: 6,
    max_doses_per_day: 4,
  },
];

async function seedDrugs() {
  console.log('🌱 Seeding drugs data...');

  // Clear existing drugs
  await prisma.drug.deleteMany({});
  
  // Create new drugs
  await prisma.drug.createMany({
    data: drugsData,
  });

  console.log(`✅ Seeded ${drugsData.length} drugs successfully!`);
  console.log('🎉 Drugs seeding completed!');
}

if (require.main === module) {
  seedDrugs()
    .catch((e) => {
      console.error('❌ Error seeding drugs:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedDrugs };