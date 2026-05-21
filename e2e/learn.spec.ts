import { test, expect } from '@playwright/test';
import { signIn } from './helpers/auth';

test.describe('Learning Hub', () => {
  test.skip(!process.env.E2E_EMAIL, 'Skipped: E2E_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('learn hub landing page loads with modules', async ({ page }) => {
    await page.goto('/app/learn');
    await expect(page.getByRole('heading', { name: /learn|learning hub/i })).toBeVisible();
    // Should show module or path content
    await expect(page.locator('[data-testid="module-card"], .module-card, article').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('module detail page loads', async ({ page }) => {
    await page.goto('/app/learn/modules/module-001');
    await expect(page.locator('h1')).toBeVisible();
    // Should show completion button or content
    await expect(page.locator('main')).toBeVisible();
  });

  test('path detail page loads', async ({ page }) => {
    await page.goto('/app/learn/paths/path-001');
    await expect(page.locator('h1')).toBeVisible();
    // Progress bar should be present
    await expect(page.locator('[role="progressbar"], .progress, [class*="progress"]').first()).toBeVisible({
      timeout: 8_000,
    });
  });
});
