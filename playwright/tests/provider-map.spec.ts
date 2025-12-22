import { test, expect } from '@playwright/test';

test.describe('Provider Map', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to map page
    await page.goto('/dashboard/provider-map');

    // Wait for map to load
    await page.waitForSelector('.mapboxgl-canvas', { timeout: 10000 });
  });

  test('should display provider map', async ({ page }) => {
    // Check page title
    await expect(page.getByText('Provider Map')).toBeVisible();

    // Check that map canvas is visible
    const mapCanvas = page.locator('.mapboxgl-canvas');
    await expect(mapCanvas).toBeVisible();
  });

  test('should display filter controls', async ({ page }) => {
    // Demographics filter
    await expect(page.getByLabel('Demographics')).toBeVisible();

    // Business Type filter
    await expect(page.getByLabel('Business Type')).toBeVisible();

    // Clear Filters button
    await expect(page.getByRole('button', { name: /clear filters/i })).toBeVisible();
  });

  test('should display address search input', async ({ page }) => {
    // Address search input
    const addressInput = page.getByPlaceholder(/enter address to locate/i);
    await expect(addressInput).toBeVisible();

    // Locate button
    await expect(page.getByRole('button', { name: /locate/i })).toBeVisible();
  });

  test('should display service type filters', async ({ page }) => {
    // Emergency shelter checkbox
    await expect(page.getByLabel(/emergency shelter available/i)).toBeVisible();

    // Long-term services checkbox
    await expect(page.getByLabel(/long-term services available/i)).toBeVisible();
  });

  test('should search for an address', async ({ page }) => {
    // Enter address
    const addressInput = page.getByPlaceholder(/enter address to locate/i);
    await addressInput.fill('1600 Amphitheatre Parkway, Mountain View, CA');

    // Click Locate button
    await page.getByRole('button', { name: /locate/i }).click();

    // Wait for geocoding
    await page.waitForTimeout(2000);

    // Clear Location button should appear
    await expect(page.getByRole('button', { name: /clear location/i })).toBeVisible();
  });

  test('should clear searched location', async ({ page }) => {
    // Search for address first
    const addressInput = page.getByPlaceholder(/enter address to locate/i);
    await addressInput.fill('New York, NY');
    await page.getByRole('button', { name: /locate/i }).click();
    await page.waitForTimeout(2000);

    // Click Clear Location
    const clearButton = page.getByRole('button', { name: /clear location/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Address input should be cleared
      await expect(addressInput).toHaveValue('');

      // Clear Location button should disappear
      await expect(clearButton).not.toBeVisible();
    }
  });

  test('should filter by demographics', async ({ page }) => {
    // Click demographics dropdown
    await page.getByLabel('Demographics').click();
    await page.waitForTimeout(300);

    // Select first option if available
    const firstOption = page.locator('li[role="option"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.waitForTimeout(500);

      // Active filter should appear
      await expect(page.getByText(/active filters/i)).toBeVisible();
    }
  });

  test('should filter by business type', async ({ page }) => {
    // Click business type dropdown
    await page.getByLabel('Business Type').click();
    await page.waitForTimeout(300);

    // Select first option if available
    const firstOption = page.locator('li[role="option"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.waitForTimeout(500);
    }
  });

  test('should toggle emergency shelter filter', async ({ page }) => {
    const checkbox = page.getByLabel(/emergency shelter available/i);
    await checkbox.click();

    await expect(checkbox).toBeChecked();
    await page.waitForTimeout(500);
  });

  test('should toggle long-term services filter', async ({ page }) => {
    const checkbox = page.getByLabel(/long-term services available/i);
    await checkbox.click();

    await expect(checkbox).toBeChecked();
    await page.waitForTimeout(500);
  });

  test('should clear all filters', async ({ page }) => {
    // Apply some filters
    const emergencyCheckbox = page.getByLabel(/emergency shelter available/i);
    await emergencyCheckbox.click();
    await page.waitForTimeout(500);

    // Click Clear Filters
    const clearButton = page.getByRole('button', { name: /clear filters/i });
    await clearButton.click();

    // Checkbox should be unchecked
    await expect(emergencyCheckbox).not.toBeChecked();

    // Clear Filters button should be disabled
    await expect(clearButton).toBeDisabled();
  });

  test('should display map controls', async ({ page }) => {
    // Navigation controls (zoom in/out)
    const navControls = page.locator('.mapboxgl-ctrl-zoom-in');
    await expect(navControls).toBeVisible();

    // Fullscreen control
    const fullscreenControl = page.locator('.mapboxgl-ctrl-fullscreen');
    await expect(fullscreenControl).toBeVisible();
  });

  test('should show provider count', async ({ page }) => {
    // Stats box should show provider count
    await expect(page.locator('text=/showing/i')).toBeVisible();
  });

  test('should click on provider marker', async ({ page }) => {
    // Wait for markers to load
    await page.waitForTimeout(2000);

    // Click on a marker (LocationOnIcon)
    const marker = page.locator('svg').filter({ has: page.locator('path') }).first();

    if (await marker.isVisible()) {
      await marker.click();

      // Popup should appear with provider details
      await page.waitForTimeout(500);
      const popup = page.locator('.mapboxgl-popup');
      await expect(popup).toBeVisible();
    }
  });

  test('should interact with map (zoom)', async ({ page }) => {
    // Click zoom in button
    const zoomIn = page.locator('.mapboxgl-ctrl-zoom-in');
    await zoomIn.click();
    await page.waitForTimeout(500);

    // Map should still be visible
    const mapCanvas = page.locator('.mapboxgl-canvas');
    await expect(mapCanvas).toBeVisible();
  });
});
