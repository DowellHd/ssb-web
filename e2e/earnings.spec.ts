import { test, expect } from '@playwright/test';
import { signIn } from './helpers/auth';

test.describe('Earnings Calendar', () => {
  test.skip(!process.env.E2E_EMAIL, 'Skipped: E2E_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('earnings calendar loads and shows data', async ({ page }) => {
    await page.goto('/app/earnings');
    await expect(page.getByRole('heading', { name: /earnings calendar/i })).toBeVisible();
    // Should show at least one symbol row
    await expect(page.getByText('NVDA').first()).toBeVisible();
  });

  test('filter tabs work', async ({ page }) => {
    await page.goto('/app/earnings');
    await expect(page.getByRole('button', { name: /upcoming/i })).toBeVisible();
    await page.click('button:has-text("upcoming")');
    // Past events should now be filtered out
    await expect(page.getByText('No earnings events')).not.toBeVisible();
  });

  test('shows simulated data disclaimer', async ({ page }) => {
    await page.goto('/app/earnings');
    await expect(page.getByText(/simulated data/i)).toBeVisible();
  });
});
