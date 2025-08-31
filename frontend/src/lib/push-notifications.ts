// Push Notifications Utility for OTC Recommender

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPermissionResult {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

class PushNotificationManager {
  private vapidPublicKey: string | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return false;
      }

      // Check if push messaging is supported
      if (!('PushManager' in window)) {
        console.warn('Push messaging not supported');
        return false;
      }

      // Register service worker
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermissionResult> {
    if (!('Notification' in window)) {
      return { granted: false, denied: true, default: false };
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default',
    };
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermissionResult {
    if (!('Notification' in window)) {
      return { granted: false, denied: true, default: false };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default',
    };
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscriptionData | null> {
    try {
      if (!this.serviceWorkerRegistration) {
        throw new Error('Service Worker not registered');
      }

      if (!this.vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      // Check permission
      const permissionResult = await this.requestPermission();
      if (!permissionResult.granted) {
        throw new Error('Notification permission not granted');
      }

      // Subscribe to push service
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      // Convert subscription to our format
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };

      console.log('Push subscription created:', subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.serviceWorkerRegistration) {
        return false;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push subscription removed');
      }

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current push subscription
   */
  async getCurrentSubscription(): Promise<PushSubscriptionData | null> {
    try {
      if (!this.serviceWorkerRegistration) {
        return null;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (!subscription) {
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };
    } catch (error) {
      console.error('Failed to get current subscription:', error);
      return null;
    }
  }

  /**
   * Check if user is currently subscribed
   */
  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    return subscription !== null;
  }

  /**
   * Send subscription to server
   */
  async sendSubscriptionToServer(subscriptionData: PushSubscriptionData): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          ...subscriptionData,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Subscription sent to server:', result);
      return result.success;
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      return false;
    }
  }

  /**
   * Remove subscription from server
   */
  async removeSubscriptionFromServer(endpoint?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/push/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ endpoint }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Subscription removed from server:', result);
      return result.success;
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      return false;
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  }

  /**
   * Show local notification (fallback)
   */
  showLocalNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });
    }
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
  }

  private getAuthToken(): string {
    // Get JWT token from localStorage or cookies
    return localStorage.getItem('authToken') || '';
  }
}

// Export singleton instance
export const pushNotificationManager = new PushNotificationManager();

// Export utility functions
export const initializePushNotifications = () => pushNotificationManager.initialize();
export const requestNotificationPermission = () => pushNotificationManager.requestPermission();
export const subscribeToPushNotifications = () => pushNotificationManager.subscribe();
export const unsubscribeFromPushNotifications = () => pushNotificationManager.unsubscribe();
export const isSubscribedToPushNotifications = () => pushNotificationManager.isSubscribed();
export const sendTestPushNotification = () => pushNotificationManager.sendTestNotification();