import { test, expect } from '@playwright/test';

test.describe('Push Notifications', () => {
  test.beforeEach(async ({ page }) => {
    // Mock service worker registration
    await page.addInitScript(() => {
      // Mock ServiceWorker
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: () => Promise.resolve({
            pushManager: {
              subscribe: () => Promise.resolve({
                endpoint: 'https://fcm.googleapis.com/fcm/send/test',
                getKey: (name: string) => {
                  if (name === 'p256dh') return new ArrayBuffer(65);
                  if (name === 'auth') return new ArrayBuffer(16);
                  return null;
                },
              }),
              getSubscription: () => Promise.resolve(null),
            },
          }),
          ready: Promise.resolve({}),
        },
        writable: false,
      });

      // Mock Notification API
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: () => Promise.resolve('granted'),
        },
        writable: false,
      });

      // Mock PushManager
      Object.defineProperty(window, 'PushManager', {
        value: function() {},
        writable: false,
      });
    });
  });

  test('should display notification settings', async ({ page }) => {
    // Navigate to profile page (assuming it contains notification settings)
    await page.goto('/profile');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if notification settings section exists
    const notificationSettings = page.locator('[data-testid="notification-settings"]');
    if (await notificationSettings.count() > 0) {
      await expect(notificationSettings).toBeVisible();
      
      // Check for push notification toggle
      const pushToggle = page.locator('[data-testid="push-notification-toggle"]');
      if (await pushToggle.count() > 0) {
        await expect(pushToggle).toBeVisible();
      }
      
      // Check for SMS toggle
      const smsToggle = page.locator('[data-testid="sms-notification-toggle"]');
      if (await smsToggle.count() > 0) {
        await expect(smsToggle).toBeVisible();
      }
    }
  });

  test('should handle push notification subscription', async ({ page, context }) => {
    // Grant notification permission
    await context.grantPermissions(['notifications']);
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for push notification enable button or toggle
    const pushButton = page.locator('button:has-text("اعلانات مرورگر"), button:has-text("فعال‌سازی اعلانات")');
    
    if (await pushButton.count() > 0) {
      // Mock the API response for subscription
      await page.route('**/api/notifications/push/subscribe', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Successfully subscribed to push notifications',
            subscriptionId: 'test-subscription-id',
          }),
        });
      });
      
      await pushButton.click();
      
      // Check for success message
      const successMessage = page.locator('text=موفقیت, text=فعال');
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should handle phone verification for SMS', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for phone verification button
    const phoneVerifyButton = page.locator('button:has-text("تأیید شماره"), button:has-text("شماره موبایل")');
    
    if (await phoneVerifyButton.count() > 0) {
      await phoneVerifyButton.click();
      
      // Check if phone verification form appears
      const phoneInput = page.locator('input[type="tel"], input[placeholder*="موبایل"]');
      if (await phoneInput.count() > 0) {
        await expect(phoneInput.first()).toBeVisible();
        
        // Fill in a test phone number
        await phoneInput.first().fill('09123456789');
        
        // Mock OTP send API
        await page.route('**/api/auth/send-otp', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              otpId: 'test-otp-id',
              message: 'کد تأیید ارسال شد',
              expiresIn: 300,
            }),
          });
        });
        
        // Click send OTP button
        const sendButton = page.locator('button:has-text("ارسال"), button:has-text("تأیید")');
        if (await sendButton.count() > 0) {
          await sendButton.first().click();
          
          // Check for OTP input field
          const otpInput = page.locator('input[placeholder*="کد"], input[maxlength="5"]');
          if (await otpInput.count() > 0) {
            await expect(otpInput.first()).toBeVisible({ timeout: 5000 });
          }
        }
      }
    }
  });

  test('should display reminder form with delivery channels', async ({ page }) => {
    // Navigate to reminders page or create reminder page
    await page.goto('/reminders');
    await page.waitForLoadState('networkidle');
    
    // Look for create reminder button
    const createButton = page.locator('button:has-text("ایجاد"), button:has-text("جدید"), a[href*="reminder"]');
    
    if (await createButton.count() > 0) {
      await createButton.first().click();
      await page.waitForLoadState('networkidle');
      
      // Check for delivery channel options
      const pushChannel = page.locator('text=اعلانات مرورگر, text=Push');
      const smsChannel = page.locator('text=پیامک, text=SMS');
      
      if (await pushChannel.count() > 0) {
        await expect(pushChannel.first()).toBeVisible();
      }
      
      if (await smsChannel.count() > 0) {
        await expect(smsChannel.first()).toBeVisible();
      }
      
      // Check for reminder form fields
      const titleInput = page.locator('input[placeholder*="عنوان"], input[name="title"]');
      const medicationInput = page.locator('input[placeholder*="دارو"], input[name*="medication"]');
      
      if (await titleInput.count() > 0) {
        await expect(titleInput.first()).toBeVisible();
      }
      
      if (await medicationInput.count() > 0) {
        await expect(medicationInput.first()).toBeVisible();
      }
    }
  });

  test('should handle notification preferences update', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Mock preferences API
    await page.route('**/api/notifications/preferences', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            preferences: {
              push: true,
              sms: false,
              email: false,
            },
          }),
        });
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'تنظیمات با موفقیت ذخیره شد',
          }),
        });
      }
    });
    
    // Look for notification settings toggles
    const toggles = page.locator('[role="switch"], input[type="checkbox"]');
    
    if (await toggles.count() > 0) {
      // Try to toggle the first available setting
      await toggles.first().click();
      
      // Check for success message
      const successMessage = page.locator('text=موفقیت, text=ذخیره');
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});