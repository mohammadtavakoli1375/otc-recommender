'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Calculator, BookOpen, Shield } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Stethoscope,
    title: "تشخیص هوشمند",
    description: "ارزیابی علائم بر اساس پروتکل‌های علمی و ارائه پیشنهادات مناسب",
    color: "text-blue-600"
  },
  {
    icon: Calculator,
    title: "محاسبه دوز دقیق",
    description: "محاسبه دوز مناسب داروها بر اساس سن، وزن و شرایط بیمار",
    color: "text-green-600"
  },
  {
    icon: BookOpen,
    title: "راهنمای جامع",
    description: "دسترسی به مقالات علمی و راهنماهای کاربردی داروهای OTC",
    color: "text-purple-600"
  },
  {
    icon: Shield,
    title: "ایمنی بالا",
    description: "بررسی تداخلات دارویی و هشدارهای مهم برای استفاده ایمن",
    color: "text-red-600"
  }
];

export function BenefitsCards() {
  return (
    <section className="py-6 px-4 md:py-10 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">مزایای سیستم</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto mb-4 p-3 rounded-full bg-gray-50">
                        <Icon className={`h-8 w-8 ${benefit.color}`} />
                      </div>
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm text-center leading-relaxed">
                        {benefit.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}