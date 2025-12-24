import { Page } from '@playwright/test';

/**
 * Logs in a user with credentials from environment variables
 * @param page - Playwright page object
 */
export async function login(page: Page) {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL || 'test@anchorpoint.example.com';
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD || 'testPassword123!';
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  // Navigate to login page with full URL
  await page.goto(`${baseURL}/login`);

  // Wait for form to be ready
  await page.waitForSelector('input[type="email"]', { state: 'visible' });

  // Fill in credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit the form and wait for navigation in one go
  await Promise.all([
    page.waitForURL(/.*dashboard/, { timeout: 20000 }),
    page.click('button[type="submit"]')
  ]);
}

/**
 * Logs out the current user
 * @param page - Playwright page object
 */
export async function logout(page: Page) {
  // Click profile menu
  await page.click('[aria-label="profile"]');

  // Click logout option
  await page.click('text=Logout');

  // Wait for redirect to login page
  await page.waitForURL(/.*login/, { timeout: 5000 });
}
