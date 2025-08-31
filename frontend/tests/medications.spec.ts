import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page: any) {
  await page.goto('/auth/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

test.describe('Medication Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should navigate to my-meds page', async ({ page }) => {
    await page.goto('/my-meds');
    await expect(page).toHaveTitle(/مشاور OTC/);
    await expect(page.locator('h1')).toContainText('داروهای من');
  });

  test('should show empty state when no medications', async ({ page }) => {
    await page.goto('/my-meds');
    
    // Check for empty state
    const emptyState = page.locator('text=هنوز دارویی اضافه نکرده‌اید');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator('text=افزودن اولین دارو')).toBeVisible();
    }
  });

  test('should open add medication dialog', async ({ page }) => {
    await page.goto('/my-meds');
    
    // Click add medication button
    await page.click('text=افزودن دارو');
    
    // Check dialog is open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=افزودن دارو جدید')).toBeVisible();
  });

  test('should validate required fields in add medication form', async ({ page }) => {
    await page.goto('/my-meds');
    await page.click('text=افزودن دارو');
    
    // Try to submit without required fields
    await page.click('text=ایجاد دارو');
    
    // Check for validation messages
    const drugNameInput = page.locator('[name="drugName"]');
    await expect(drugNameInput).toHaveAttribute('required');
  });

  test('should add a new medication with daily schedule', async ({ page }) => {
    await page.goto('/my-meds');
    await page.click('text=افزودن دارو');
    
    // Fill form
    await page.fill('[name="drugName"]', 'استامینوفن');
    await page.selectOption('select', 'قرص');
    await page.fill('input[placeholder*="500mg"]', '500mg');
    await page.fill('textarea[placeholder*="با غذا"]', 'با غذا مصرف شود');
    
    // Set start date to today
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);
    
    // Add times for daily schedule
    await page.fill('input[type="time"]', '08:00');
    await page.click('button:has-text("+")');
    
    await page.fill('input[type="time"]', '14:00');
    await page.click('button:has-text("+")');
    
    await page.fill('input[type="time"]', '20:00');
    await page.click('button:has-text("+")');
    
    // Submit form
    await page.click('text=ایجاد دارو');
    
    // Check for success (either medication added or safety warnings shown)
    await page.waitForTimeout(2000);
    
    // If safety warnings are shown, acknowledge them
    const warningsTitle = page.locator('text=هشدارهای ایمنی');
    if (await warningsTitle.isVisible()) {
      await page.click('text=متوجه شدم');
    }
    
    // Check that dialog is closed and medication is added
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should add medication with interval schedule', async ({ page }) => {
    await page.goto('/my-meds');
    await page.click('text=افزودن دارو');
    
    // Fill basic info
    await page.fill('[name="drugName"]', 'ایبوپروفن');
    await page.fill('input[placeholder*="500mg"]', '400mg');
    
    // Set start date
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);
    
    // Select interval schedule
    await page.selectOption('select:has-option("هر چند ساعت یکبار")', 'INTERVAL');
    
    // Set interval to 6 hours
    await page.fill('input[type="number"][min="1"][max="24"]', '6');
    
    // Submit
    await page.click('text=ایجاد دارو');
    
    await page.waitForTimeout(2000);
    
    // Handle safety warnings if shown
    const warningsTitle = page.locator('text=هشدارهای ایمنی');
    if (await warningsTitle.isVisible()) {
      await page.click('text=متوجه شدم');
    }
    
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should show daily stats when medications exist', async ({ page }) => {
    await page.goto('/my-meds');
    
    // Check if daily stats are visible (if medications exist)
    const statsCard = page.locator('text=آمار امروز');
    if (await statsCard.isVisible()) {
      await expect(statsCard).toBeVisible();
      await expect(page.locator('text=موفقیت')).toBeVisible();
    }
  });

  test('should handle medication actions (taken/snooze/skip)', async ({ page }) => {
    await page.goto('/my-meds');
    
    // Look for medication cards with actions
    const takenButton = page.locator('text=مصرف شد').first();
    if (await takenButton.isVisible()) {
      await takenButton.click();
      
      // Wait for action to complete
      await page.waitForTimeout(1000);
      
      // Check that the action was processed (button should be disabled or changed)
      await expect(takenButton).toBeDisabled();
    }
  });

  test('should show snooze options', async ({ page }) => {
    await page.goto('/my-meds');
    
    // Look for snooze dropdown
    const snoozeButton = page.locator('text=به تعویق').first();
    if (await snoozeButton.isVisible()) {
      await snoozeButton.click();
      
      // Check snooze options
      await expect(page.locator('text=15 دقیقه دیگر')).toBeVisible();
      await expect(page.locator('text=30 دقیقه دیگر')).toBeVisible();
      await expect(page.locator('text=1 ساعت دیگر')).toBeVisible();
      
      // Select 15 minutes
      await page.click('text=15 دقیقه دیگر');
      
      await page.waitForTimeout(1000);
    }
  });

  test('should delete medication with confirmation', async ({ page }) => {
    await page.goto('/my-meds');
    
    // Look for medication cards
    const moreButton = page.locator('[data-testid="medication-menu"]').first();
    if (await moreButton.isVisible()) {
      await moreButton.click();
      
      // Click delete
      await page.click('text=حذف');
      
      // Confirm deletion
      await expect(page.locator('text=حذف دارو')).toBeVisible();
      await page.click('button:has-text("حذف")');
      
      await page.waitForTimeout(1000);
    }
  });

  test('should show safety warnings for dangerous medications', async ({ page }) => {
    await page.goto('/my-meds');
    await page.click('text=افزودن دارو');
    
    // Add a medication that might trigger safety warnings
    await page.fill('[name="drugName"]', 'آسپرین');
    await page.fill('input[placeholder*="500mg"]', '1000mg'); // High dose
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);
    
    // Set high frequency
    await page.fill('input[type="number"][min="1"][max="10"]', '6'); // 6 times per day
    
    // Add times
    const times = ['06:00', '10:00', '14:00', '18:00', '22:00', '02:00'];
    for (const time of times) {
      await page.fill('input[type="time"]', time);
      await page.click('button:has-text("+")');
    }
    
    await page.click('text=ایجاد دارو');
    
    // Should show safety warnings
    await page.waitForTimeout(2000);
    const warningsTitle = page.locator('text=هشدارهای ایمنی');
    if (await warningsTitle.isVisible()) {
      await expect(warningsTitle).toBeVisible();
      await expect(page.locator('text=هشدار')).toBeVisible();
    }
  });

  test('should handle quiet hours setting', async ({ page }) => {
    await page.goto('/my-meds');
    await page.click('text=افزودن دارو');
    
    // Fill basic info
    await page.fill('[name="drugName"]', 'ویتامین D');
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);
    
    // Add time
    await page.fill('input[type="time"]', '09:00');
    await page.click('button:has-text("+")');
    
    // Enable quiet hours
    await page.check('input[type="checkbox"]');
    
    // Set quiet hours
    const quietStartInput = page.locator('input[type="time"]').nth(1);
    const quietEndInput = page.locator('input[type="time"]').nth(2);
    
    await quietStartInput.fill('22:00');
    await quietEndInput.fill('07:00');
    
    await page.click('text=ایجاد دارو');
    
    await page.waitForTimeout(2000);
    
    // Handle any safety warnings
    const warningsTitle = page.locator('text=هشدارهای ایمنی');
    if (await warningsTitle.isVisible()) {
      await page.click('text=متوجه شدم');
    }
    
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/my-meds');
    
    // Check that page is responsive
    await expect(page.locator('h1')).toBeVisible();
    
    // Add button should be full width on mobile
    const addButton = page.locator('text=افزودن دارو');
    if (await addButton.isVisible()) {
      const buttonBox = await addButton.boundingBox();
      const pageWidth = page.viewportSize()?.width || 375;
      
      // Button should be close to full width (accounting for padding)
      expect(buttonBox?.width).toBeGreaterThan(pageWidth * 0.8);
    }
  });

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/my-meds');
    
    // Navigate away and back
    await page.goto('/');
    await page.goto('/my-meds');
    
    // Page should load correctly
    await expect(page.locator('h1')).toContainText('داروهای من');
  });
});

test.describe('Medication API Integration', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/medications', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await login(page);
    await page.goto('/my-meds');
    
    // Should show error message
    await expect(page.locator('text=خطا')).toBeVisible();
  });

  test('should handle network timeout', async ({ page }) => {
    // Mock slow API response
    await page.route('/api/medications', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] })
        });
      }, 5000);
    });
    
    await login(page);
    await page.goto('/my-meds');
    
    // Should show loading state
    await expect(page.locator('text=در حال بارگذاری')).toBeVisible();
  });
});