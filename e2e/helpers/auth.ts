import { type Page } from '@playwright/test';

/** Signs in using the test credentials from env vars. */
export async function signIn(page: Page) {
  const email = process.env.E2E_EMAIL ?? 'test@example.com';
  const password = process.env.E2E_PASSWORD ?? 'testpassword';

  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page.waitForURL('**/app/dashboard', { timeout: 15_000 });
}
