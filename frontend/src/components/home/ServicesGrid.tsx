'use client';

import Link from 'next/link';
import { Stethoscope, Calculator, Pill, BookOpen, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PharmacyFinder from '@/components/maps/PharmacyFinder';

const services = [
  {
    title: 'تشخیص علائم',
    href: '/symptoms',
    icon: Stethoscope,
    description: 'ارزیابی علائم و دریافت راهنمایی',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    textColor: 'text-white',
  },
  {
    title: 'ماشین‌حساب دوز',
    href: '/dose-calculator',
    icon: Calculator,
    description: 'محاسبه دوز مناسب دارو',
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    textColor: 'text-white',
  },
  {
    title: 'داروهای من',
    href: '/my-meds',
    icon: Pill,
    description: 'مدیریت داروهای شخصی',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    textColor: 'text-white',
    needsLogin: true,
  },
  {
    title: 'محتوای آموزشی',
    href: '/education',
    icon: BookOpen,
    description: 'مقالات و راهنماهای سلامت',
    color: 'bg-gradient-to-br from-orange-500 to-orange-600',
    textColor: 'text-white',
  },
  {
    title: 'پروفایل',
    href: '/profile',
    icon: User,
    description: 'مدیریت حساب کاربری',
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    textColor: 'text-white',
  },
  {
    title: 'نزدیک‌ترین داروخانه‌ها',
    description: 'جستجوی داروخانه‌های اطراف',
    icon: MapPin,
    color: 'bg-gradient-to-br from-teal-500 to-teal-600',
    textColor: 'text-white',
    href: '#pharmacy-finder',
    comingSoon: false,
    isPharmacyFinder: true,
  },
];

export default function ServicesGrid() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPharmacyFinder, setShowPharmacyFinder] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleClick = (service: typeof services[0], e: React.MouseEvent) => {
    if (service.isPharmacyFinder) {
      e.preventDefault();
      setShowPharmacyFinder(true);
      return;
    }
    
    if (service.needsLogin && !isLoggedIn) {
      e.preventDefault();
      window.location.href = '/auth/login';
      return;
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="px-4 py-4"
      >
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">خدمات اصلی</h2>
          <p className="text-sm text-gray-600">دسترسی سریع به امکانات مشاور OTC</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.4 + index * 0.08 }}
              >
                <Link
                  href={service.href}
                  onClick={(e) => handleClick(service, e)}
                  className={`block p-3 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 active:scale-95 ${service.color}`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                      <Icon className={`h-5 w-5 ${service.textColor}`} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-sm ${service.textColor} mb-1`}>
                        {service.title}
                      </h3>
                      <p className={`text-xs ${service.textColor} opacity-90 leading-tight`}>
                        {service.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
        
        {/* PharmacyFinder Modal */}
        {showPharmacyFinder && (
          <PharmacyFinder onClose={() => setShowPharmacyFinder(false)} />
        )}
      </>
    );
}