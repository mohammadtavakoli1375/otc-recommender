'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Stethoscope, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

// Analytics tracking function
const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    const windowWithGtag = window as Window & { gtag?: (event: string, eventName: string, properties?: Record<string, unknown>) => void };
    if (windowWithGtag.gtag) {
      windowWithGtag.gtag('event', eventName, properties);
    }
  }
};

export function Hero() {
  const handleCTAClick = (type: 'primary' | 'secondary') => {
    trackEvent('hero_cta_click', {
      cta_type: type,
      cta_text: type === 'primary' ? 'شروع ارزیابی علائم' : 'مطالعه راهنماها',
    });
  };

  return (
    <section className="py-6 px-4 md:py-10 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.2,
            ease: "easeOut"
          }}
          style={{
            animation: 'fadeInUp 0.8s ease-out',
            transition: 'all 0.3s ease'
          }}
          className="motion-reduce:animate-none motion-reduce:transition-none"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="text-center md:text-right">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                راهنمای هوشمند
                <span className="text-blue-700"> داروهای OTC</span>
                <br />
                <span className="text-lg md:text-2xl font-medium text-gray-700">
                  برای مصرف صحیح و ایمن
                </span>
              </h1>
              <p className="text-sm md:text-base text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                با استفاده از پروتکل‌های علمی و به‌روز، بهترین داروهای OTC را برای علائم خود پیدا کنید و از مصرف صحیح آنها اطمینان حاصل کنید
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link 
                  href="/symptoms" 
                  className="w-full sm:w-auto"
                  prefetch={true}
                  onClick={() => handleCTAClick('primary')}
                >
                  <Button 
                    size="lg" 
                    className="w-full md:w-auto px-8 h-11 text-base font-medium min-h-[44px] bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    aria-label="شروع ارزیابی علائم - مرحله اول تشخیص"
                  >
                    <Stethoscope className="ml-2 h-5 w-5" aria-hidden="true" />
                    شروع ارزیابی علائم
                  </Button>
                </Link>
                <Link 
                  href="/education" 
                  className="w-full sm:w-auto text-blue-700 hover:text-blue-800 underline underline-offset-4 flex items-center justify-center gap-2 h-11 px-4 min-h-[44px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  onClick={() => handleCTAClick('secondary')}
                  aria-label="مطالعه راهنماهای آموزشی داروهای OTC"
                >
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                  مطالعه راهنماها
                </Link>
              </div>
            </div>
            
            {/* Hero Illustration */}
            <div className="order-first md:order-last">
              <div className="w-full max-w-md mx-auto md:max-w-none" style={{ maxWidth: '480px' }}>
                <Image
                  src="/hero-illustration.webp"
                  alt="تصویر مشاوره پزشکی: خانواده در حال دریافت راهنمایی برای استفاده صحیح از داروهای OTC"
                  width={480}
                  height={480}
                  className="w-full h-auto rounded-lg"
                  priority
                  sizes="(max-width: 768px) 100vw, 480px"
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA="
                  style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}