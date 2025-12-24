import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseURL}/login`);
  });

  test('should display login page with logo', async ({ page }) => {
    // Check that the Anchor Point logo is visible
    const logo = page.locator('img[alt="Anchor Point"]');
    await expect(logo).toBeVisible();

    // Verify logo size (should be 220px as per recent update)
    await expect(logo).toHaveAttribute('width', '220');
  });

  test('should display login form', async ({ page }) => {
    // Check for "Welcome Back!" heading
    await expect(page.getByText('Welcome Back!')).toBeVisible();

    // Check for credentials prompt
    await expect(page.getByText('Enter your credentials to continue')).toBeVisible();

    // Check for email and password fields
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to submit without filling in credentials
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show validation messages
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('should attempt login with valid credentials', async ({ page }) => {
    // Fill in login form
    await page.fill('input[type="email"]', process.env.PLAYWRIGHT_TEST_EMAIL || 'test@anchorpoint.example.com');
    await page.fill('input[type="password"]', process.env.PLAYWRIGHT_TEST_PASSWORD || 'testPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation or error message
    await page.waitForTimeout(1000);
  });
});
