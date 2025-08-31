'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const banners = [
  {
    id: 1,
    title: 'مشاوره هوشمند دارویی',
    subtitle: 'تشخیص علائم و دریافت راهنمایی تخصصی در چند ثانیه',
    cta: 'شروع ارزیابی',
    href: '/symptoms',
    bgColor: 'bg-gradient-to-l from-blue-500 to-blue-600',
    illustration: (
      <div className="relative">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="h-12 w-12 text-white" strokeWidth={1.5} />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'محاسبه دوز دقیق',
    subtitle: 'محاسبه دوز مناسب دارو بر اساس سن، وزن و شرایط خاص',
    cta: 'محاسبه دوز',
    href: '/dose-calculator',
    bgColor: 'bg-gradient-to-l from-green-500 to-green-600',
    illustration: (
      <div className="relative">
        <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm transform rotate-12">
          <div className="text-white text-2xl font-bold">Rx</div>
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-400 rounded-full animate-ping"></div>
      </div>
    ),
  },
];

export default function HeroBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const banner = banners[currentBanner];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="px-4 py-4"
    >
      <motion.div
        key={banner.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative overflow-hidden rounded-2xl shadow-lg ${banner.bgColor} p-6`}
      >
        <div className="flex items-center justify-between">
          {/* Content - Right Side */}
          <div className="flex-1 text-white">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xl font-bold mb-2 leading-tight"
            >
              {banner.title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-sm opacity-90 mb-4 leading-relaxed"
            >
              {banner.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Link href={banner.href}>
                <Button 
                  variant="outline" 
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-medium shadow-sm"
                >
                  {banner.cta}
                  <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={1.5} />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Illustration - Left Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex-shrink-0 mr-4"
          >
            {banner.illustration}
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-4 space-x-2 space-x-reverse">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentBanner ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-4 right-4 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border border-white rounded-full"></div>
        </div>
      </motion.div>
    </motion.div>
  );
}