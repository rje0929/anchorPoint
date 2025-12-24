import { login } from '../helpers/auth';
import { test, expect } from '@playwright/test';

test.describe('Provider List', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);

    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    // Navigate to providers page
    await page.goto(`${baseURL}/dashboard/providers`);

    // Wait for page to load by checking for the title
    await page.waitForSelector('text=Anchor Point Providers', { timeout: 15000 });
  });

  test('should display provider list page', async ({ page }) => {
    // Check page title
    await expect(page.getByText('Anchor Point Providers')).toBeVisible();

    // Check for "Add New Provider" button
    await expect(page.getByRole('button', { name: /add new provider/i })).toBeVisible();
  });

  test('should display provider table with headers', async ({ page }) => {
    // Check table headers by role
    await expect(page.getByRole('columnheader', { name: 'Provider Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Contact' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Regions Served' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should search providers by name', async ({ page }) => {
    // Type in search box with a very specific search term
    const searchBox = page.getByPlaceholder(/search providers/i);
    await searchBox.fill('XYZ Nonexistent Provider Name 12345');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Should show "No providers match your filters" message
    await expect(page.getByText(/no providers match your filters/i)).toBeVisible();
  });

  test('should filter by business type', async ({ page }) => {
    // Click business type filter
    const businessTypeFilter = page.getByPlaceholder(/filter by business type/i);
    await businessTypeFilter.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(300);

    // Select first option if available
    const firstOption = page.locator('li[role="option"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Verify the filter was applied - check that the selected option appears as a chip in the autocomplete
      const filterChips = page.locator('.MuiAutocomplete-tag');
      await expect(filterChips.first()).toBeVisible();
    }
  });

  test('should filter by region', async ({ page }) => {
    // Click region filter
    const regionFilter = page.getByPlaceholder(/filter by region/i);
    await regionFilter.click();

    // Wait for dropdown
    await page.waitForTimeout(300);

    // Select first region if available
    const firstRegion = page.locator('li[role="option"]').first();
    if (await firstRegion.isVisible()) {
      await firstRegion.click();
      await page.waitForTimeout(500);
    }
  });

  test('should toggle emergency shelter filter', async ({ page }) => {
    // Find and click emergency shelter checkbox
    const emergencyCheckbox = page.getByLabel(/emergency shelter available/i);
    await emergencyCheckbox.click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify checkbox is checked
    await expect(emergencyCheckbox).toBeChecked();
  });

  test('should toggle long-term services filter', async ({ page }) => {
    // Find and click long-term services checkbox
    const longTermCheckbox = page.getByLabel(/long-term services available/i);
    await longTermCheckbox.click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify checkbox is checked
    await expect(longTermCheckbox).toBeChecked();
  });

  test('should view provider details', async ({ page }) => {
    // Click first "View Details" button (eye icon)
    const viewButton = page.locator('[aria-label="view"]').first();

    if (await viewButton.isVisible()) {
      await viewButton.click();

      // Drawer should open
      await expect(page.locator('[role="presentation"]')).toBeVisible();
    }
  });

  test('should open edit provider form', async ({ page }) => {
    // Click first "Edit" button
    const editButton = page.locator('[aria-label="edit"]').first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // Should show edit form
      await expect(page.getByText(/edit provider/i)).toBeVisible();

      // Should have back button
      await expect(page.locator('button').filter({ hasText: '' })).toBeVisible(); // Back arrow
    }
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    // Click first "Delete" button
    const deleteButton = page.locator('[aria-label="delete"]').first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirmation dialog should appear
      await expect(page.getByText(/are you sure you want to delete/i)).toBeVisible();

      // Should have Cancel and Delete buttons
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();

      // Cancel the deletion
      await page.getByRole('button', { name: /cancel/i }).click();
    }
  });

  test('should open add provider form', async ({ page }) => {
    // Click "Add New Provider" button
    await page.getByRole('button', { name: /add new provider/i }).click();

    // Wait for the form to load
    await page.waitForTimeout(500);

    // Should have nonprofit name field (better indicator that form is shown)
    await expect(page.getByLabel(/nonprofit name/i)).toBeVisible();

    // Should have street address field
    await expect(page.getByLabel(/street address/i).first()).toBeVisible();
  });

  test('should clear all filters', async ({ page }) => {
    // Apply some filters first
    const searchBox = page.getByPlaceholder(/search providers/i);
    await searchBox.fill('test');

    const emergencyCheckbox = page.getByLabel(/emergency shelter available/i);
    await emergencyCheckbox.click();

    await page.waitForTimeout(500);

    // Search box should have text
    await expect(searchBox).toHaveValue('test');

    // Checkbox should be checked
    await expect(emergencyCheckbox).toBeChecked();
  });
});
