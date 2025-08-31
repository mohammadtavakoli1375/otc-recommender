import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentCategory, ContentType, FAQCategory } from '@prisma/client';

@Injectable()
export class EducationalContentService {
  constructor(private prisma: PrismaService) {}

  async getEducationalContent(
    category?: ContentCategory,
    type?: ContentType,
    featured?: boolean,
    limit = 20,
    offset = 0
  ) {
    const where: any = {
      is_published: true,
    };

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (featured !== undefined) {
      where.is_featured = featured;
    }

    const [content, total] = await Promise.all([
      this.prisma.educationalContent.findMany({
        where,
        orderBy: [
          { is_featured: 'desc' },
          { view_count: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.educationalContent.count({ where }),
    ]);

    return {
      content,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getContentBySlug(slug: string) {
    const content = await this.prisma.educationalContent.findUnique({
      where: { slug, is_published: true },
    });

    if (!content) {
      throw new NotFoundException('محتوای آموزشی یافت نشد');
    }

    // Increment view count
    await this.prisma.educationalContent.update({
      where: { id: content.id },
      data: { view_count: { increment: 1 } },
    });

    return content;
  }

  async getFeaturedContent(limit = 6) {
    return this.prisma.educationalContent.findMany({
      where: {
        is_published: true,
        is_featured: true,
      },
      orderBy: [
        { view_count: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });
  }

  async getRelatedContent(contentId: string, category: ContentCategory, limit = 4) {
    return this.prisma.educationalContent.findMany({
      where: {
        is_published: true,
        category,
        id: { not: contentId },
      },
      orderBy: [
        { view_count: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });
  }

  async searchContent(query: string, limit = 20, offset = 0) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    if (searchTerms.length === 0) {
      return {
        content: [],
        total: 0,
        hasMore: false,
      };
    }

    // Simple text search - in production, you might want to use full-text search
    const where = {
      is_published: true,
      OR: searchTerms.flatMap(term => [
        { title_fa: { contains: term } },
        { content_fa: { contains: term } },
        { summary_fa: { contains: term } },
      ]),
    };

    const [content, total] = await Promise.all([
      this.prisma.educationalContent.findMany({
        where,
        orderBy: [
          { is_featured: 'desc' },
          { view_count: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.educationalContent.count({ where }),
    ]);

    return {
      content,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getFAQs(
    category?: FAQCategory,
    featured?: boolean,
    limit = 20,
    offset = 0
  ) {
    const where: any = {
      is_published: true,
    };

    if (category) {
      where.category = category;
    }

    if (featured !== undefined) {
      where.is_featured = featured;
    }

    const [faqs, total] = await Promise.all([
      this.prisma.fAQ.findMany({
        where,
        orderBy: [
          { is_featured: 'desc' },
          { view_count: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.fAQ.count({ where }),
    ]);

    return {
      faqs,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getFAQBySlug(slug: string) {
    const faq = await this.prisma.fAQ.findUnique({
      where: { slug, is_published: true },
    });

    if (!faq) {
      throw new NotFoundException('سوال متداول یافت نشد');
    }

    // Increment view count
    await this.prisma.fAQ.update({
      where: { id: faq.id },
      data: { view_count: { increment: 1 } },
    });

    return faq;
  }

  async searchFAQs(query: string, limit = 20, offset = 0) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    if (searchTerms.length === 0) {
      return {
        faqs: [],
        total: 0,
        hasMore: false,
      };
    }

    const where = {
      is_published: true,
      OR: searchTerms.flatMap(term => [
        { question_fa: { contains: term } },
        { answer_fa: { contains: term } },
      ]),
    };

    const [faqs, total] = await Promise.all([
      this.prisma.fAQ.findMany({
        where,
        orderBy: [
          { is_featured: 'desc' },
          { view_count: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.fAQ.count({ where }),
    ]);

    return {
      faqs,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getContentCategories() {
    return Object.values(ContentCategory).map(category => ({
      value: category,
      label: this.getCategoryLabel(category),
    }));
  }

  async getFAQCategories() {
    return Object.values(FAQCategory).map(category => ({
      value: category,
      label: this.getFAQCategoryLabel(category),
    }));
  }

  private getCategoryLabel(category: ContentCategory): string {
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
    };
    return labels[category] || category;
  }

  private getFAQCategoryLabel(category: FAQCategory): string {
    const labels = {
      GENERAL: 'عمومی',
      DOSAGE: 'دوز دارو',
      SAFETY: 'ایمنی',
      SIDE_EFFECTS: 'عوارض جانبی',
      DRUG_INTERACTIONS: 'تداخلات دارویی',
      PREGNANCY: 'بارداری',
      CHILDREN: 'کودکان',
      ELDERLY: 'سالمندان',
      CHRONIC_CONDITIONS: 'بیماری‌های مزمن',
      EMERGENCY: 'اورژانس',
    };
    return labels[category] || category;
  }
}