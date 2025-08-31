'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "آیا این سیستم جایگزین پزشک است؟",
    answer: "خیر، این سیستم فقط برای راهنمایی اولیه طراحی شده و هیچ‌گاه جایگزین مشاوره پزشک نیست. در صورت وجود علائم شدید، حتماً به پزشک مراجعه کنید."
  },
  {
    question: "چگونه از صحت اطلاعات اطمینان حاصل کنم؟",
    answer: "تمام اطلاعات بر اساس منابع معتبر علمی و پروتکل‌های بین‌المللی تهیه شده‌اند. همچنین توصیه می‌شود قبل از مصرف هر دارو با داروساز مشورت کنید."
  },
  {
    question: "آیا سیستم برای کودکان مناسب است؟",
    answer: "سیستم قابلیت محاسبه دوز برای گروه‌های سنی مختلف از جمله کودکان را دارد، اما برای کودکان زیر ۲ سال حتماً با پزشک مشورت کنید."
  }
];

export function QuickFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-6 px-4 md:py-10 md:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            سوالات متداول
          </h2>
          
          <div className="space-y-4 mb-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-4 text-right hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors"
                  aria-expanded={openIndex === index}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 text-sm md:text-base">
                      {faq.question}
                    </h3>
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0 mr-2" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 mr-2" />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="pt-0 pb-4">
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/education">
              <Button variant="outline" className="h-11">
                مشاهده همه سوالات متداول
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}