import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('login page should have proper heading structure', async ({ page }) => {
    await page.goto('/login');

    // Should have main heading
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();
  });

  test('provider list should have accessible table', async ({ page }) => {
    await page.goto('/dashboard/providers');
    await page.waitForSelector('table');

    // Table should have headers
    const headers = page.locator('th');
    expect(await headers.count()).toBeGreaterThan(0);
  });

  test('buttons should have accessible labels', async ({ page }) => {
    await page.goto('/dashboard/providers');

    // All icon buttons should have aria-labels
    const iconButtons = page.locator('button[aria-label]');
    expect(await iconButtons.count()).toBeGreaterThan(0);
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/dashboard/providers');
    await page.getByRole('button', { name: /add new provider/i }).click();
    await page.waitForTimeout(1000);

    // Nonprofit name input should have associated label
    const nonprofitInput = page.getByLabel(/nonprofit name/i);
    await expect(nonprofitInput).toBeVisible();
  });

  test('map should be keyboard navigable', async ({ page }) => {
    await page.goto('/dashboard/provider-map');
    await page.waitForSelector('.mapboxgl-canvas', { timeout: 10000 });

    // Tab to focus on map controls
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Some element should have focus
    const focusedElement = await page.locator(':focus');
    expect(await focusedElement.count()).toBe(1);
  });

  test('checkboxes should have labels', async ({ page }) => {
    await page.goto('/dashboard/providers');

    // Emergency shelter checkbox should have label
    const checkbox = page.getByLabel(/emergency shelter/i);
    await expect(checkbox).toBeVisible();
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/login');

    // Logo should have alt text
    const logo = page.locator('img[alt="Anchor Point"]');
    await expect(logo).toHaveAttribute('alt');
  });

  test('dialogs should be accessible', async ({ page }) => {
    await page.goto('/dashboard/providers');
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
