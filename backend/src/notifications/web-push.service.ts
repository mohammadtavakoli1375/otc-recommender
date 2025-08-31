import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.initializeWebPush();
  }

  private initializeWebPush() {
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const vapidSubject = this.configService.get<string>('VAPID_SUBJECT', 'mailto:admin@otc-recommender.com');

    if (!vapidPublicKey || !vapidPrivateKey) {
      this.logger.warn('VAPID keys not configured. Web push notifications will not work.');
      return;
    }

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey,
    );

    this.logger.log('Web Push service initialized with VAPID keys');
  }

  async subscribe(userId: string, subscription: PushSubscriptionData, userAgent?: string) {
    try {
      // Check if subscription already exists
      const existingSubscription = await this.prisma.pushSubscription.findUnique({
        where: {
          user_id_endpoint: {
            user_id: userId,
            endpoint: subscription.endpoint,
          },
        },
      });

      if (existingSubscription) {
        // Update existing subscription
        return await this.prisma.pushSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            user_agent: userAgent,
            is_active: true,
            updatedAt: new Date(),
          },
        });
      }

      // Create new subscription
      return await this.prisma.pushSubscription.create({
        data: {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: userAgent,
          is_active: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to save push subscription for user ${userId}:`, error);
      throw error;
    }
  }

  async unsubscribe(userId: string, endpoint?: string) {
    try {
      if (endpoint) {
        // Unsubscribe specific endpoint
        await this.prisma.pushSubscription.updateMany({
          where: {
            user_id: userId,
            endpoint: endpoint,
          },
          data: {
            is_active: false,
          },
        });
      } else {
        // Unsubscribe all endpoints for user
        await this.prisma.pushSubscription.updateMany({
          where: {
            user_id: userId,
          },
          data: {
            is_active: false,
          },
        });
      }

      this.logger.log(`Push subscription(s) deactivated for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe user ${userId}:`, error);
      throw error;
    }
  }

  async sendNotification(
    userId: string,
    payload: PushNotificationPayload,
    subscriptionId?: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const result = { success: 0, failed: 0, errors: [] as string[] };

    try {
      // Get user's active subscriptions
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: {
          user_id: userId,
          is_active: true,
          ...(subscriptionId && { id: subscriptionId }),
        },
      });

      if (subscriptions.length === 0) {
        this.logger.warn(`No active push subscriptions found for user ${userId}`);
        return result;
      }

      const notificationPayload = JSON.stringify(payload);

      // Send to all subscriptions
      const promises = subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          };

          await webpush.sendNotification(pushSubscription, notificationPayload);
          result.success++;
          this.logger.log(`Push notification sent successfully to subscription ${subscription.id}`);
        } catch (error) {
          result.failed++;
          const errorMessage = `Failed to send push notification to subscription ${subscription.id}: ${error.message}`;
          result.errors.push(errorMessage);
          this.logger.error(errorMessage);

          // If subscription is invalid, deactivate it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await this.prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { is_active: false },
            });
            this.logger.log(`Deactivated invalid push subscription ${subscription.id}`);
          }
        }
      });

      await Promise.all(promises);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send push notifications to user ${userId}:`, error);
      throw error;
    }
  }

  async getUserSubscriptions(userId: string) {
    return await this.prisma.pushSubscription.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      select: {
        id: true,
        endpoint: true,
        user_agent: true,
        createdAt: true,
      },
    });
  }

  async testNotification(userId: string) {
    const payload: PushNotificationPayload = {
      title: 'تست اعلان',
      body: 'این یک پیام تستی از سیستم OTC Recommender است.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    };

    return await this.sendNotification(userId, payload);
  }
}