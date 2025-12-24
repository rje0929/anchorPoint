import { login } from '../helpers/auth';
import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('login page should have proper heading structure', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseURL}/login`);

    // Should have main heading
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();
  });

  test('provider list should have accessible table', async ({ page }) => {
    await login(page);
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseURL}/dashboard/providers`);
    await page.waitForSelector('table');

    // Table should have headers
    const headers = page.locator('th');
    expect(await headers.count()).toBeGreaterThan(0);
  });

  test('buttons should have accessible labels', async ({ page }) => {
    await login(page);
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseURL}/dashboard/providers`);
    await page.waitForSelector('table');

    // All icon buttons should have aria-labels (edit, delete buttons)
    const iconButtons = page.locator('[aria-label="edit"], [aria-label="delete"]');
    expect(await iconButtons.count()).toBeGreaterThan(0);
  });

  test('form inputs should have labels', async ({ page }) => {
    await login(page);
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseURL}/dashboard/providers`);
    await page.getByRole('button', { name: /add new provider/i }).click();
    await page.waitForTimeout(1000);

    // Nonprofit name input should have associated label
    const nonprofitInput = page.getByLabel(/nonprofit name/i);
    await expect(nonprofitInput).toBeVisible();
  });

  test('checkboxes should have labels', async ({ page }) => {
    await login(page);
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseURL}/dashboard/providers`);

    // Emergency shelter checkbox should have label
    const checkbox = page.getByLabel(/emergency shelter/i);
    await expect(checkbox).toBeVisible();
  });

  test('images should have alt text', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseURL}/login`);

    // Logo should have alt text
    const logo = page.locator('img[alt="Anchor Point"]');
    await expect(logo).toHaveAttribute('alt');
  });

  test('dialogs should be accessible', async ({ page }) => {
    await login(page);
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseURL}/dashboard/providers`);
    await page.waitForSelector('table');

    // Open delete dialog
    const deleteButton = page.locator('[aria-label="delete"]').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Dialog should have role
      const dialog = page.locator('[role="dialog"]').or(page.locator('[role="alertdialog"]')).first();
      await expect(dialog).toBeVisible();
    }
  });
});
