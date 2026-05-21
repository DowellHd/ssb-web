import { test, expect } from '@playwright/test';
import { signIn } from './helpers/auth';

test.describe('Paper Trading', () => {
  test.skip(!process.env.E2E_EMAIL, 'Skipped: E2E_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('paper trading page loads', async ({ page }) => {
    await page.goto('/app/paper');
    await expect(page.getByRole('heading', { name: /paper trading/i })).toBeVisible();
  });

  test('leaderboard page loads', async ({ page }) => {
    await page.goto('/app/paper/leaderboard');
    await expect(page.getByRole('heading', { name: /leaderboard/i })).toBeVisible();
    await expect(page.getByText(/simulated only|simulated performance/i)).toBeVisible();
  });

  test('shows disclaimer on paper trading page', async ({ page }) => {
    await page.goto('/app/paper');
    // Simulated trading disclaimer should be visible
    await expect(page.getByText(/simulated|educational/i).first()).toBeVisible();
  });
});
