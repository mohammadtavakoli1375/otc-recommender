'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Search, Eye, Calendar, ArrowRight, HelpCircle, Star } from 'lucide-react';

interface Article {
  id: string;
  title_fa: string;
  summary_fa?: string;
  category: string;
  type: string;
  slug: string;
  is_featured: boolean;
  view_count: number;
  createdAt: string;
}

interface FAQ {
  id: string;
  question_fa: string;
  answer_fa: string;
  category: string;
  slug: string;
  is_featured: boolean;
  view_count: number;
}

export default function EducationPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [articlesRes, faqsRes, featuredRes] = await Promise.all([
        fetch('/api/education/articles'),
        fetch('/api/education/faqs'),
        fetch('/api/education/articles/featured')
      ]);

      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData.content || []);
      }

      if (faqsRes.ok) {
        const faqsData = await faqsRes.json();
        setFaqs(faqsData.faqs || []);
      }

      if (featuredRes.ok) {
        const featuredData = await featuredRes.json();
        setFeaturedArticles(featuredData || []);
      }
    } catch {
      setError('خطا در بارگذاری محتوا');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const [articlesRes, faqsRes] = await Promise.all([
        fetch(`/api/education/articles/search?q=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/education/faqs/search?q=${encodeURIComponent(searchQuery)}`)
      ]);

      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData.content || []);
      }

      if (faqsRes.ok) {
        const faqsData = await faqsRes.json();
        setFaqs(faqsData.faqs || []);
      }
    } catch {
      setError('خطا در جستجو');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      COMMON_DISEASES: 'بیماری‌های شایع',
      MEDICATION_SAFETY: 'ایمنی دارو',
      DRUG_ADMINISTRATION: 'نحوه مصرف دارو',
      SIDE_EFFECTS: 'عوارض جانبی',
      DRUG_INTERACTIONS: 'تداخلات دارویی',
      SPECIAL_POPULATIONS: 'جمعیت‌های ویژه',
      EMERGENCY_CARE: 'مراقبت‌های اورژانسی',
      PREVENTION: 'پیشگیری',
      LIFESTYLE: 'سبک زندگی',
      GENERAL: 'عمومی',
      DOSAGE: 'دوز دارو',
      SAFETY: 'ایمنی',
      PREGNANCY: 'بارداری',
      CHILDREN: 'کودکان',
      ELDERLY: 'سالمندان',
      CHRONIC_CONDITIONS: 'بیماری‌های مزمن',
      EMERGENCY: 'اورژانس'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      ARTICLE: 'مقاله',
      GUIDE: 'راهنما',
      FAQ: 'سوال متداول',
      VIDEO: 'ویدیو',
      INFOGRAPHIC: 'اینفوگرافیک',
      CHECKLIST: 'چک‌لیست'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری محتوای آموزشی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">مرکز آموزش و اطلاعات دارویی</h1>
            <p className="text-xl text-blue-100 mb-8">
              راهنماهای جامع، مقالات علمی و پاسخ به سوالات متداول
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="جستجو در مقالات و سوالات متداول..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 text-gray-900"
                />
                <Button onClick={handleSearch} className="bg-white text-blue-600 hover:bg-gray-100">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">مقالات برجسته</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2">
                        {getCategoryLabel(article.category)}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeLabel(article.type)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {article.title_fa}
                    </CardTitle>
                    {article.summary_fa && (
                      <CardDescription className="line-clamp-3">
                        {article.summary_fa}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{article.view_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(article.createdAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </div>
                      <Link href={`/education/articles/${article.slug}`}>
                        <Button size="sm" className="flex items-center gap-1">
                          <span>مطالعه</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Tabs for Articles and FAQs */}
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              مقالات آموزشی
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              سوالات متداول
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles">
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="mb-2">
                          {getCategoryLabel(article.category)}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(article.type)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {article.title_fa}
                      </CardTitle>
                      {article.summary_fa && (
                        <CardDescription className="line-clamp-3">
                          {article.summary_fa}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{article.view_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(article.createdAt).toLocaleDateString('fa-IR')}</span>
                          </div>
                        </div>
                        <Link href={`/education/articles/${article.slug}`}>
                          <Button size="sm" className="flex items-center gap-1">
                            <span>مطالعه</span>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">مقاله‌ای یافت نشد</h3>
                <p className="text-gray-500">در حال حاضر مقاله‌ای برای نمایش وجود ندارد.</p>
              </div>
            )}
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs">
            {faqs.length > 0 ? (
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <Card key={faq.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="mb-2">
                          {getCategoryLabel(faq.category)}
                        </Badge>
                        {faq.is_featured && (
                          <Badge variant="default">
                            <Star className="h-3 w-3 ml-1" />
                            برجسته
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {faq.question_fa}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {faq.answer_fa}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Eye className="h-4 w-4" />
                          <span>{faq.view_count} بازدید</span>
                        </div>
                        <Link href={`/education/faqs/${faq.slug}`}>
                          <Button size="sm" variant="outline">
                            جزئیات بیشتر
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">سوالی یافت نشد</h3>
                <p className="text-gray-500">در حال حاضر سوال متداولی برای نمایش وجود ندارد.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}