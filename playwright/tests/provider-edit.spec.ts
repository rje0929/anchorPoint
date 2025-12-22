import { test, expect } from '@playwright/test';

test.describe('Edit Provider', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to providers page
    await page.goto('/dashboard/providers');
    await page.waitForSelector('table', { timeout: 10000 });

    // Click first "Edit" button
    const editButton = page.locator('[aria-label="edit"]').first();
    await editButton.click();

    // Wait for edit form to load
    await page.waitForTimeout(1000);
  });

  test('should display edit provider form', async ({ page }) => {
    // Check for back button
    const backButton = page.locator('button[aria-label="back"]').or(page.locator('svg[data-testid="ArrowBackIcon"]').locator('..')).first();
    await expect(backButton).toBeVisible();

    // Nonprofit name should be pre-filled
    const nonprofitName = page.getByLabel(/nonprofit name/i);
    await expect(nonprofitName).not.toHaveValue('');
  });

  test('should update nonprofit name', async ({ page }) => {
    const nonprofitName = page.getByLabel(/nonprofit name/i);

    // Clear and enter new name
    await nonprofitName.clear();
    await nonprofitName.fill('Updated Nonprofit Name');

    // Value should be updated
    await expect(nonprofitName).toHaveValue('Updated Nonprofit Name');
  });

  test('should update description', async ({ page }) => {
    const description = page.getByLabel(/description/i);

    if (await description.isVisible()) {
      await description.clear();
      await description.fill('This is an updated description for the provider.');

      await expect(description).toHaveValue(/updated description/i);
    }
  });

  test('should have save changes button enabled', async ({ page }) => {
    // Make a change
    const nonprofitName = page.getByLabel(/nonprofit name/i);
    await nonprofitName.fill('Modified Name');

    // Save button should be enabled
    const saveButton = page.getByRole('button', { name: /save changes/i });
    await expect(saveButton).toBeEnabled();
  });

  test('should have delete provider button', async ({ page }) => {
    // Delete button should be visible
    const deleteButton = page.getByRole('button', { name: /delete provider/i });
    await expect(deleteButton).toBeVisible();
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    // Click Delete Provider button
    const deleteButton = page.getByRole('button', { name: /delete provider/i });
    await deleteButton.click();

    // Confirmation dialog should appear
    await expect(page.getByText(/are you sure you want to delete/i)).toBeVisible();

    // Should show provider name in dialog
    await expect(page.locator('strong')).toBeVisible();

    // Should have Cancel and Delete buttons
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();

    // Cancel the deletion
    await page.getByRole('button', { name: /cancel/i }).click();

    // Dialog should close
    await expect(page.getByText(/are you sure you want to delete/i)).not.toBeVisible();
  });

  test('should cancel edit and return to list', async ({ page }) => {
    // Click Cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i }).first();
    await cancelButton.click();

    // Should return to provider list
    await expect(page.getByText('Anchor Point Providers')).toBeVisible();
  });

  test('should go back using back button', async ({ page }) => {
    // Click back arrow button
    const backButton = page.locator('button').filter({ has: page.locator('svg[data-testid="ArrowBackIcon"]') }).first();

    if (await backButton.isVisible()) {
      await backButton.click();

      // Should return to provider list
      await expect(page.getByText('Anchor Point Providers')).toBeVisible();
    }
  });

  test('should update address fields', async ({ page }) => {
    // Update street address
    const streetAddress = page.getByLabel(/street address 1/i);
    if (await streetAddress.isVisible()) {
      await streetAddress.clear();
      await streetAddress.fill('456 Updated Avenue');

      await expect(streetAddress).toHaveValue('456 Updated Avenue');
    }
  });

  test('should toggle checkboxes', async ({ page }) => {
    // Find any checkbox (e.g., emergency shelter, ADA compliant, etc.)
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count > 0) {
      const firstCheckbox = checkboxes.first();
      const initialState = await firstCheckbox.isChecked();

      // Toggle it
      await firstCheckbox.click();

      // State should change
      await expect(firstCheckbox).toBeChecked({ checked: !initialState });
    }
  });
});
