'use client';

import Link from 'next/link';
import { Thermometer, Sparkles, Heart, Baby, Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  {
    title: 'سرماخوردگی',
    href: '/education?category=cold',
    icon: Thermometer,
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-200',
  },
  {
    title: 'پوست و مو',
    href: '/education?category=skin',
    icon: Sparkles,
    color: 'bg-pink-100 text-pink-600',
    borderColor: 'border-pink-200',
  },
  {
    title: 'گوارش',
    href: '/education?category=digestive',
    icon: Heart,
    color: 'bg-green-100 text-green-600',
    borderColor: 'border-green-200',
  },
  {
    title: 'کودکان',
    href: '/education?category=children',
    icon: Baby,
    color: 'bg-yellow-100 text-yellow-600',
    borderColor: 'border-yellow-200',
  },
  {
    title: 'آلرژی',
    href: '/education?category=allergy',
    icon: Shield,
    color: 'bg-red-100 text-red-600',
    borderColor: 'border-red-200',
  },
  {
    title: 'سلامت عمومی',
    href: '/education?category=general',
    icon: Activity,
    color: 'bg-purple-100 text-purple-600',
    borderColor: 'border-purple-200',
  },
];

export default function EducationalCategories() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
      className="py-4"
    >
      <div className="px-4 mb-3">
        <h2 className="text-lg font-bold text-gray-900 mb-1">دسته‌بندی‌های آموزشی</h2>
        <p className="text-sm text-gray-600">انتخاب موضوع مورد علاقه</p>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 space-x-reverse px-4 pb-2">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.7 + index * 0.05 }}
                className="flex-shrink-0"
              >
                <Link
                  href={category.href}
                  className={`flex flex-col items-center p-4 bg-white rounded-2xl border-2 ${category.borderColor} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 min-w-[80px]`}
                >
                  <div className={`p-3 rounded-full ${category.color} mb-2`}>
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                    {category.title}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}