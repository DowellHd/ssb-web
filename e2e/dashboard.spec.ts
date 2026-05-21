import { test, expect } from '@playwright/test';
import { signIn } from './helpers/auth';

test.describe('Dashboard', () => {
  test.skip(!process.env.E2E_EMAIL, 'Skipped: E2E_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('dashboard loads with key sections', async ({ page }) => {
    await page.goto('/app/dashboard');
    // Sidebar should be present
    await expect(page.getByRole('navigation')).toBeVisible();
    // Main content should load (at least one card or heading)
    await expect(page.locator('main')).toBeVisible();
  });

  test('theme toggle switches between dark and light', async ({ page }) => {
    await page.goto('/app/dashboard');
    // Find theme toggle button
    const toggle = page.getByRole('button', { name: /light mode|dark mode/i });
    await expect(toggle).toBeVisible();
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    await toggle.click();
    const newClass = await html.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });

  test('sidebar navigation links are present', async ({ page }) => {
    await page.goto('/app/dashboard');
    // Check some key nav links exist
    await expect(page.getByRole('link', { name: /paper trading/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /learn/i })).toBeVisible();
  });
});
