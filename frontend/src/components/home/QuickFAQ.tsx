'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';

const faqs = [
  {
    id: 'faq-1',
    question: 'آیا می‌توانم بدون مشورت پزشک از این اپلیکیشن استفاده کنم؟',
    answer: 'این اپلیکیشن برای راهنمایی اولیه طراحی شده و جایگزین مشاوره پزشک نیست. در موارد جدی حتماً با پزشک مشورت کنید.',
  },
  {
    id: 'faq-2',
    question: 'چگونه دوز مناسب دارو را محاسبه کنم؟',
    answer: 'از بخش "ماشین‌حساب دوز" استفاده کنید. سن، وزن و نوع دارو را وارد کنید تا دوز مناسب محاسبه شود.',
  },
  {
    id: 'faq-3',
    question: 'آیا اطلاعات من محفوظ است؟',
    answer: 'بله، تمام اطلاعات شما با بالاترین استانداردهای امنیتی محافظت می‌شود و با اشخاص ثالث به اشتراک گذاشته نمی‌شود.',
  },
];

export default function QuickFAQ() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.9 }}
      className="px-4 py-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">سوالات متداول</h2>
          <p className="text-sm text-gray-600">پاسخ سوالات رایج کاربران</p>
        </div>
        <Link href="/education/faqs">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            مشاهده همه
            <ArrowLeft className="h-4 w-4 mr-1" strokeWidth={1.5} />
          </Button>
        </Link>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 1.1 + index * 0.05 }}
            >
              <AccordionItem value={faq.id} className="border-gray-100">
                <AccordionTrigger className="px-4 py-3 text-right hover:no-underline hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900 text-right">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.3 }}
        className="mt-4 text-center"
      >
        <Link href="/education/faqs">
          <Button variant="outline" className="rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-600">
            مشاهده تمام سوالات
            <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={1.5} />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}