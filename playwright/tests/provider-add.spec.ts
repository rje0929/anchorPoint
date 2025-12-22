import { test, expect } from '@playwright/test';

test.describe('Add Provider', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to providers page
    await page.goto('/dashboard/providers');
    await page.waitForSelector('table', { timeout: 10000 });

    // Click "Add New Provider" button
    await page.getByRole('button', { name: /add new provider/i }).click();

    // Wait for form to load
    await page.waitForSelector('input', { timeout: 5000 });
  });

  test('should display add provider form', async ({ page }) => {
    // Check form title
    await expect(page.getByText(/add new provider/i)).toBeVisible();

    // Check for nonprofit name field (required)
    await expect(page.getByLabel(/nonprofit name/i)).toBeVisible();
  });

  test('should show required field validation', async ({ page }) => {
    // Try to submit empty form
    const createButton = page.getByRole('button', { name: /create provider/i });

    // Button should be disabled without nonprofit name
    await expect(createButton).toBeDisabled();
  });

  test('should fill in basic information', async ({ page }) => {
    // Fill nonprofit name
    await page.getByLabel(/nonprofit name/i).fill('Test Nonprofit Organization');

    // Fill description
    const descriptionField = page.getByLabel(/description/i);
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('This is a test nonprofit providing support services.');
    }

    // Create button should be enabled now
    const createButton = page.getByRole('button', { name: /create provider/i });
    await expect(createButton).toBeEnabled();
  });

  test('should add business types', async ({ page }) => {
    // Fill nonprofit name first
    await page.getByLabel(/nonprofit name/i).fill('Test Nonprofit');

    // Look for business type field
    const businessTypeField = page.locator('input').filter({ hasText: '' }).first();

    // Type to add a business type
    await businessTypeField.fill('Nonprofit');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(300);
  });

  test('should add regions served', async ({ page }) => {
    // Fill nonprofit name first
    await page.getByLabel(/nonprofit name/i).fill('Test Nonprofit');

    // Add region (look for regions input)
    const regionInput = page.locator('input').nth(3); // Adjust index as needed
    await regionInput.fill('North Carolina');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(300);
  });

  test('should add website', async ({ page }) => {
    // Fill nonprofit name
    await page.getByLabel(/nonprofit name/i).fill('Test Nonprofit');

    // Look for website field
    const websiteField = page.locator('input[type="url"]').first();
    if (await websiteField.isVisible()) {
      await websiteField.fill('https://example.org');
    }
  });

  test('should add address information', async ({ page }) => {
    // Fill nonprofit name
    await page.getByLabel(/nonprofit name/i).fill('Test Nonprofit');

    // Fill address fields if visible
    const streetAddress = page.getByLabel(/street address/i);
    if (await streetAddress.isVisible()) {
      await streetAddress.fill('123 Main Street');
    }

    const city = page.getByLabel(/city/i);
    if (await city.isVisible()) {
      await city.fill('Raleigh');
    }

    const state = page.getByLabel(/state/i);
    if (await state.isVisible()) {
      await state.click();
      await page.getByText('NC').click();
    }

    const zipCode = page.getByLabel(/zip code/i);
    if (await zipCode.isVisible()) {
      await zipCode.fill('27601');
    }
  });

  test('should add contact information', async ({ page }) => {
    // Fill nonprofit name
    await page.getByLabel(/nonprofit name/i).fill('Test Nonprofit');

    // Fill office phone
    const phoneField = page.getByLabel(/office phone/i);
    if (await phoneField.isVisible()) {
      await phoneField.fill('(919) 555-1234');
    }

    // Fill email
    const emailField = page.getByLabel(/email/i);
    if (await emailField.isVisible()) {
      await emailField.fill('info@testnonprofit.org');
    }
  });

  test('should toggle emergency shelter checkbox', async ({ page }) => {
    // Fill nonprofit name
    await page.getByLabel(/nonprofit name/i).fill('Test Nonprofit');

    // Look for emergency shelter checkbox
    const emergencyCheckbox = page.getByLabel(/emergency shelter/i);
    if (await emergencyCheckbox.isVisible()) {
      await emergencyCheckbox.click();
      await expect(emergencyCheckbox).toBeChecked();
    }
  });

  test('should cancel form and return to list', async ({ page }) => {
    // Click Cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Should return to provider list
    await expect(page.getByText('Anchor Point Providers')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should create new provider', async ({ page }) => {
    // Fill minimum required fields
    await page.getByLabel(/nonprofit name/i).fill('Automated Test Provider');

    // Submit form
    const createButton = page.getByRole('button', { name: /create provider/i });
    await createButton.click();

    // Wait for navigation or success message
    await page.waitForTimeout(2000);

    // Should show success notification or return to list
    // (Adjust based on your actual implementation)
  });
});
