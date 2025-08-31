import { Controller, Get, Param, Query } from '@nestjs/common';
import { EducationalContentService } from './educational-content.service';
import { ContentCategory, ContentType, FAQCategory } from '@prisma/client';

@Controller('educational-content')
export class EducationalContentController {
  constructor(private educationalContentService: EducationalContentService) {}

  @Get('articles')
  async getArticles(
    @Query('category') category?: ContentCategory,
    @Query('type') type?: ContentType,
    @Query('featured') featured?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const featuredBool = featured === 'true' ? true : featured === 'false' ? false : undefined;

    return this.educationalContentService.getEducationalContent(
      category,
      type,
      featuredBool,
      limitNum,
      offsetNum
    );
  }

  @Get('articles/featured')
  async getFeaturedArticles(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 6;
    return this.educationalContentService.getFeaturedContent(limitNum);
  }

  @Get('articles/search')
  async searchArticles(
    @Query('q') query: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    return this.educationalContentService.searchContent(query, limitNum, offsetNum);
  }

  @Get('articles/:slug')
  async getArticleBySlug(@Param('slug') slug: string) {
    return this.educationalContentService.getContentBySlug(slug);
  }

  @Get('articles/:id/related')
  async getRelatedArticles(
    @Param('id') contentId: string,
    @Query('category') category: ContentCategory,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 4;
    return this.educationalContentService.getRelatedContent(contentId, category, limitNum);
  }

  @Get('faqs')
  async getFAQs(
    @Query('category') category?: FAQCategory,
    @Query('featured') featured?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const featuredBool = featured === 'true' ? true : featured === 'false' ? false : undefined;

    return this.educationalContentService.getFAQs(category, featuredBool, limitNum, offsetNum);
  }

  @Get('faqs/search')
  async searchFAQs(
    @Query('q') query: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    return this.educationalContentService.searchFAQs(query, limitNum, offsetNum);
  }

  @Get('faqs/:slug')
  async getFAQBySlug(@Param('slug') slug: string) {
    return this.educationalContentService.getFAQBySlug(slug);
  }

  @Get('categories')
  async getCategories() {
    return this.educationalContentService.getContentCategories();
  }

  @Get('faq-categories')
  async getFAQCategories() {
    return this.educationalContentService.getFAQCategories();
  }
}