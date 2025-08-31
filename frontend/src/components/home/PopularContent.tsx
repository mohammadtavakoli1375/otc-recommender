'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';

const popularArticles = [
  {
    id: 1,
    title: 'راهنمای کامل مصرف ایبوپروفن',
    summary: 'نحوه مصرف، دوز مناسب و عوارض جانبی ایبوپروفن برای درمان درد و التهاب',
    category: 'ضد درد',
    categoryColor: 'bg-blue-100 text-blue-700',
    readTime: '5 دقیقه',
    views: '2.1K',
    href: '/education/articles/ibuprofen-guide',
    image: '/hero-illustration.webp',
  },
  {
    id: 2,
    title: 'درمان سرماخوردگی در کودکان',
    summary: 'بهترین روش‌های درمان سرماخوردگی کودکان و داروهای مناسب هر سن',
    category: 'کودکان',
    categoryColor: 'bg-green-100 text-green-700',
    readTime: '7 دقیقه',
    views: '1.8K',
    href: '/education/articles/children-cold-treatment',
    image: '/hero-illustration.webp',
  },
  {
    id: 3,
    title: 'مدیریت آلرژی فصلی',
    summary: 'شناسایی علائم آلرژی فصلی و روش‌های پیشگیری و درمان موثر',
    category: 'آلرژی',
    categoryColor: 'bg-orange-100 text-orange-700',
    readTime: '4 دقیقه',
    views: '1.5K',
    href: '/education/articles/seasonal-allergy-management',
    image: '/hero-illustration.webp',
  },
];

export default function PopularContent() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.7 }}
      className="px-4 py-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">محتوای محبوب</h2>
          <p className="text-sm text-gray-600">مقالات پربازدید هفته</p>
        </div>
        <Link href="/education">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            مشاهده همه
            <ArrowLeft className="h-4 w-4 mr-1" strokeWidth={1.5} />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {popularArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
          >
            <Link
              href={article.href}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] overflow-hidden"
            >
              <div className="flex">
                {/* Image */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${article.categoryColor} border-0`}
                    >
                      {article.category}
                    </Badge>
                    <div className="flex items-center space-x-3 space-x-reverse text-xs text-gray-500">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Eye className="h-3 w-3" strokeWidth={1.5} />
                        <span>{article.views}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
                    {article.title}
                  </h3>
                  
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.1 }}
        className="mt-4 text-center"
      >
        <Link href="/education">
          <Button variant="outline" className="rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-600">
            مشاهده تمام مقالات
            <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={1.5} />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}