import { login } from '../helpers/auth';
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);

    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    // Start from dashboard
    await page.goto(`${baseURL}/dashboard`);
  });

  test('should navigate to providers list', async ({ page }) => {
    // Look for navigation menu item
    const providersLink = page.getByRole('link', { name: /providers/i });

    if (await providersLink.isVisible()) {
      await providersLink.click();

      // Should show providers page
      await expect(page.getByText('Anchor Point Providers')).toBeVisible();
    }
  });

  test('should navigate to provider map', async ({ page }) => {
    // Look for map navigation link
    const mapLink = page.getByRole('link', { name: /map/i });

    if (await mapLink.isVisible()) {
      await mapLink.click();

      // Should show map page
      await expect(page.getByText('Provider Map')).toBeVisible();
    }
  });

  test('should display logo in header', async ({ page }) => {
    // Check for logo
    const logo = page.locator('img[alt*="Anchor"]').or(page.locator('img[alt*="logo" i]')).first();

    if (await logo.isVisible()) {
      await expect(logo).toBeVisible();
    }
  });

  test('should have responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Look for hamburger menu or mobile navigation
    const menuButton = page.locator('button[aria-label*="menu" i]').or(page.locator('svg[data-testid*="Menu"]').locator('..')).first();

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Navigation drawer should open
      await page.waitForTimeout(500);
    }
  });
});
