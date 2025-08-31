'use client';

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";

const popularArticles = [
  {
    title: "راهنمای کامل داروهای ضد درد",
    summary: "همه چیز درباره انواع مسکن‌ها، دوز مناسب و نکات ایمنی مصرف آنها",
    readTime: "۵ دقیقه",
    href: "/education/articles/pain-relievers"
  },
  {
    title: "درمان سرماخوردگی و آنفولانزا",
    summary: "بهترین داروهای OTC برای تسکین علائم سرماخوردگی و تقویت سیستم ایمنی",
    readTime: "۷ دقیقه",
    href: "/education/articles/cold-flu"
  },
  {
    title: "مدیریت مشکلات گوارشی",
    summary: "راهکارهای موثر برای درمان نفخ، سوء هاضمه و سایر مشکلات گوارشی",
    readTime: "۶ دقیقه",
    href: "/education/articles/digestive-issues"
  }
];

export function PopularContent() {
  return (
    <section className="py-6 px-4 md:py-10 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              مطالب آموزشی محبوب
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              راهنماهای کاربردی برای استفاده بهینه از داروهای بدون نسخه
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {popularArticles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.5 + index * 0.1 }}
              >
                <Link href={article.href}>
                  <Card className="h-full hover:shadow-md transition-shadow duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime}</span>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed mb-4">
                        {article.summary}
                      </CardDescription>
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        <BookOpen className="h-4 w-4 ml-1" />
                        مطالعه مقاله
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/education">
              <Button variant="outline" size="lg" className="h-11">
                مشاهده همه مطالب آموزشی
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}