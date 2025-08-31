import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import type { NotificationPreferences } from './notifications.service';
import { WebPushService, PushSubscriptionData } from './web-push.service';
import { SmsService } from './sms.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly webPushService: WebPushService,
    private readonly smsService: SmsService,
  ) {}

  @Post('push/subscribe')
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  @ApiResponse({ status: 201, description: 'Successfully subscribed to push notifications' })
  async subscribeToPush(
    @Request() req,
    @Body() subscriptionData: PushSubscriptionData & { userAgent?: string },
  ) {
    try {
      const subscription = await this.webPushService.subscribe(
        req.user.userId,
        subscriptionData,
        subscriptionData.userAgent,
      );

      return {
        success: true,
        message: 'Successfully subscribed to push notifications',
        subscriptionId: subscription.id,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to subscribe to push notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('push/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  @ApiResponse({ status: 200, description: 'Successfully unsubscribed from push notifications' })
  async unsubscribeFromPush(
    @Request() req,
    @Body() body?: { endpoint?: string },
  ) {
    try {
      await this.webPushService.unsubscribe(req.user.userId, body?.endpoint);

      return {
        success: true,
        message: 'Successfully unsubscribed from push notifications',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to unsubscribe from push notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('push/subscriptions')
  @ApiOperation({ summary: 'Get user push subscriptions' })
  @ApiResponse({ status: 200, description: 'User push subscriptions retrieved successfully' })
  async getPushSubscriptions(@Request() req) {
    try {
      const subscriptions = await this.webPushService.getUserSubscriptions(req.user.userId);
      return {
        success: true,
        subscriptions,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve push subscriptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('push/test')
  @ApiOperation({ summary: 'Send test push notification' })
  @ApiResponse({ status: 200, description: 'Test push notification sent successfully' })
  async sendTestPush(@Request() req) {
    try {
      const result = await this.webPushService.testNotification(req.user.userId);
      return {
        success: true,
        message: 'Test push notification sent',
        result,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send test push notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sms/test')
  @ApiOperation({ summary: 'Send test SMS' })
  @ApiResponse({ status: 200, description: 'Test SMS sent successfully' })
  async sendTestSms(
    @Request() req,
    @Body() body: { phoneNumber: string },
  ) {
    try {
      const result = await this.smsService.sendSms({
        to: body.phoneNumber,
        message: 'این یک پیام تستی از سیستم OTC Recommender است.',
      });

      return {
        success: result.success,
        message: result.success ? 'Test SMS sent successfully' : 'Failed to send test SMS',
        error: result.error,
        messageId: result.messageId,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send test SMS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({ status: 200, description: 'User notification preferences retrieved successfully' })
  async getNotificationPreferences(@Request() req) {
    try {
      const preferences = await this.notificationsService.getUserNotificationPreferences(
        req.user.userId,
      );
      return {
        success: true,
        preferences,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve notification preferences',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiResponse({ status: 200, description: 'User notification preferences updated successfully' })
  async updateNotificationPreferences(
    @Request() req,
    @Body() preferences: NotificationPreferences,
  ) {
    try {
      await this.notificationsService.updateUserNotificationPreferences(
        req.user.userId,
        preferences,
      );

      return {
        success: true,
        message: 'Notification preferences updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to update notification preferences',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  @ApiOperation({ summary: 'Get notification delivery history' })
  @ApiResponse({ status: 200, description: 'Notification delivery history retrieved successfully' })
  async getDeliveryHistory(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    try {
      const deliveries = await this.notificationsService.getDeliveryHistory(
        req.user.userId,
        limit ? parseInt(limit, 10) : undefined,
      );

      return {
        success: true,
        deliveries,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve delivery history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send')
  @ApiOperation({ summary: 'Send immediate notification' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(
    @Request() req,
    @Body() body: {
      title: string;
      message: string;
      channels: ('push' | 'sms' | 'email')[];
    },
  ) {
    try {
      const channels = body.channels.map(channel => {
        switch (channel) {
          case 'push': return 'PUSH';
          case 'sms': return 'SMS';
          case 'email': return 'EMAIL';
          default: throw new Error(`Invalid channel: ${channel}`);
        }
      }) as any[];

      const results = await this.notificationsService.sendImmediateNotification({
        userId: req.user.userId,
        title: body.title,
        body: body.message,
        channels,
      });

      return {
        success: true,
        message: 'Notification sent',
        results,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('retry/:deliveryId')
  @ApiOperation({ summary: 'Retry failed notification delivery' })
  @ApiResponse({ status: 200, description: 'Notification retry initiated successfully' })
  async retryDelivery(
    @Request() req,
    @Param('deliveryId') deliveryId: string,
  ) {
    try {
      const result = await this.notificationsService.retryFailedDelivery(deliveryId);

      return {
        success: true,
        message: 'Notification retry completed',
        result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retry notification delivery',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}