import { login } from '../helpers/auth';
import { test, expect } from '@playwright/test';

test.describe('Provider CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Set test mode marker before login
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT__ = true;
    });

    // Login before each test
    await login(page);

    // Wait for session to be fully established
    await page.waitForTimeout(1000);

    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    // Navigate to providers page
    await page.goto(`${baseURL}/dashboard/providers`);

    // Wait for page to load
    await page.waitForSelector('text=Anchor Point Providers', { timeout: 15000 });
  });

  test('should create, view, and delete a provider through UI', async ({ page }) => {
    // Listen for console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('Browser error:', msg.text());
      }
    });

    // Step 1: Click Add New Provider button
    await page.getByRole('button', { name: /add new provider/i }).click();

    // Wait for the add form to appear
    await page.waitForSelector('text=/add new provider/i', { timeout: 10000 });

    // Step 2: Fill out the basic provider information
    await page.getByLabel(/nonprofit name/i).fill('Test UI Provider');

    // Fill description
    const descriptionField = page.getByLabel(/description/i).first();
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('This is a test provider created by automated tests');
    }

    // Add a business type
    await page.getByPlaceholder(/add business type/i).fill('Nonprofit');
    await page.locator('button:has-text("Add")').first().click();

    // Add a region
    await page.getByPlaceholder(/add region/i).fill('Test Region');
    await page.locator('button:has-text("Add")').nth(1).click();

    // Fill address
    await page.getByLabel(/street address/i).first().fill('123 Test Street');
    await page.getByLabel(/city/i).fill('Test City');
    await page.getByLabel(/state/i).fill('CA');
    await page.getByLabel(/zip code/i).fill('90001');

    // Step 3: Submit the form
    const submitButton = page.getByRole('button', { name: 'Create Provider' });

    // Check if button is enabled
    const isDisabled = await submitButton.isDisabled();
    console.log('Submit button disabled:', isDisabled);

    // Take a screenshot before clicking
    await page.screenshot({ path: 'test-results/before-submit.png' });

    await submitButton.click();

    // Wait a moment and take another screenshot
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/after-submit.png' });

    // Step 4: Wait for redirect back to list and verify the provider appears
    await page.waitForSelector('text=Anchor Point Providers', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for data to load

    // Check if our test provider is in the list
    await expect(page.getByText('Test UI Provider')).toBeVisible();

    // Step 5: Clean up - delete the provider
    // Find the row with our test provider and click delete
    const providerRow = page.locator('tr', { hasText: 'Test UI Provider' });
    const deleteButton = providerRow.locator('[aria-label="delete"]');

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm deletion
      await page.waitForSelector('text=/are you sure/i', { timeout: 5000 });
      await page.getByRole('button', { name: /delete/i }).last().click();

      // Wait for deletion to complete
      await page.waitForTimeout(2000);

      // Verify the provider is no longer in the list
      await expect(page.getByText('Test UI Provider')).not.toBeVisible();
    }
  });
});
