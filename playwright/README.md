# Anchor Point - Playwright E2E Tests

Comprehensive end-to-end tests for the Anchor Point application using Playwright.

## Test Coverage

### ✅ Authentication Tests ([auth.spec.ts](tests/auth.spec.ts))
- Login page display and logo
- Form validation
- Navigation to registration
- Login attempt

### ✅ Provider List Tests ([provider-list.spec.ts](tests/provider-list.spec.ts))
- Table display and headers
- Search functionality
- Business type filtering
- Region filtering
- Emergency shelter filter
- Long-term services filter
- View provider details
- Edit provider
- Delete provider with confirmation
- Add new provider
- Clear filters

### ✅ Provider Map Tests ([provider-map.spec.ts](tests/provider-map.spec.ts))
- Map display
- Filter controls (Demographics, Business Type)
- Address search with geocoding
- Clear searched location
- Service type filters (Emergency Shelter, Long-Term Services)
- Map controls (zoom, fullscreen)
- Provider marker interaction
- Provider count display

### ✅ Add Provider Tests ([provider-add.spec.ts](tests/provider-add.spec.ts))
- Form display
- Required field validation
- Basic information entry
- Business types
- Regions served
- Website
- Address information
- Contact information
- Emergency shelter toggle
- Cancel functionality
- Create provider

### ✅ Edit Provider Tests ([provider-edit.spec.ts](tests/provider-edit.spec.ts))
- Form display with pre-filled data
- Update nonprofit name
- Update description
- Save changes
- Delete provider with confirmation
- Cancel edit
- Back navigation
- Address updates
- Toggle checkboxes

### ✅ Navigation Tests ([navigation.spec.ts](tests/navigation.spec.ts))
- Navigate to providers list
- Navigate to provider map
- Navigation menu display
- Logo display
- Responsive navigation (mobile)

### ✅ Accessibility Tests ([accessibility.spec.ts](tests/accessibility.spec.ts))
- Heading structure
- Accessible tables
- Button labels
- Form input labels
- Keyboard navigation
- Checkbox labels
- Image alt text
- Dialog accessibility

## Setup

### Prerequisites

- Node.js 18+ installed
- Application running on `http://localhost:3000`
- Backend API running on `http://localhost:3010`

### Installation

```bash
cd playwright
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in UI Mode (Recommended for Development)

```bash
npm run test:ui
```

This opens an interactive UI where you can:
- See all tests
- Run individual tests
- Watch tests run in real-time
- Debug failures
- Time travel through test execution

### Run Tests in Headed Mode

```bash
npm run test:headed
```

### Run Specific Browser

```bash
# Chrome only
npm run test:chromium

# Firefox only
npm run test:firefox

# Safari only
npm run test:webkit
```

### Run Mobile Tests

```bash
npm run test:mobile
```

### Debug Tests

```bash
npm run test:debug
```

## Test Reports

After running tests, view the HTML report:

```bash
npm run report
```

Reports include:
- Test results with pass/fail status
- Screenshots of failures
- Videos of failed tests
- Execution traces

## Code Generation

Generate test code by recording your actions:

```bash
npm run codegen
```

This will:
- Open a browser
- Record your interactions
- Generate Playwright test code

## Configuration

Test configuration is in [playwright.config.ts](playwright.config.ts):

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Parallel execution**: Enabled
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.getByRole('button', { name: /click me/i });

    // Act
    await button.click();

    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use User-Facing Selectors**
   ```typescript
   // Good
   await page.getByRole('button', { name: /submit/i });
   await page.getByLabel('Email');
   await page.getByText('Welcome');

   // Avoid
   await page.locator('#submit-btn');
   await page.locator('.email-input');
   ```

2. **Wait for Elements**
   ```typescript
   // Wait for element to be visible
   await page.waitForSelector('table');

   // Wait for navigation
   await page.waitForURL('**/dashboard');

   // Wait for load state
   await page.waitForLoadState('networkidle');
   ```

3. **Use Assertions**
   ```typescript
   await expect(element).toBeVisible();
   await expect(element).toHaveText('Expected');
   await expect(element).toBeEnabled();
   await expect(element).toBeChecked();
   ```

4. **Handle Async Operations**
   ```typescript
   // Wait for API calls
   await page.waitForTimeout(1000);

   // Or better, wait for specific response
   await page.waitForResponse(resp =>
     resp.url().includes('/api/providers') && resp.status() === 200
   );
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          npm install
          cd playwright && npm install

      - name: Install Playwright browsers
        run: cd playwright && npx playwright install --with-deps

      - name: Run Playwright tests
        run: cd playwright && npm test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright/playwright-report/
```

## Troubleshooting

### Tests Failing Due to Timeouts

Increase timeout in specific tests:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

### Element Not Found

Add wait before interaction:
```typescript
await page.waitForSelector('button');
await page.click('button');
```

### Authentication Issues

If tests require authentication, use a setup project:
```typescript
// In playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
```

### Debugging

1. **Use UI Mode**: `npm run test:ui`
2. **Use Debug Mode**: `npm run test:debug`
3. **Add console.log**: View in test output
4. **Use page.pause()**: Pause execution
   ```typescript
   await page.pause();
   ```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Selector Guide](https://playwright.dev/docs/selectors)
