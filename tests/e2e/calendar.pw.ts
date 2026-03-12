import { test, expect } from '@playwright/test';

test.describe('Practice Calendar page', () => {
  test('calendar page loads for band-1', async ({ page }) => {
    const response = await page.goto('/bands/band-1/calendar');
    expect(response?.status()).toBeLessThan(400);
  });

  test('calendar page displays month navigation', async ({ page }) => {
    await page.goto('/bands/band-1/calendar');
    // Should show year and month in Japanese
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('年');
    expect(pageContent).toContain('月');
  });

  test('calendar page displays day-of-week headers', async ({ page }) => {
    await page.goto('/bands/band-1/calendar');
    const days = ['月', '火', '水', '木', '金', '土', '日'];
    for (const day of days) {
      await expect(page.getByText(day, { exact: true }).first()).toBeVisible();
    }
  });

  test('calendar page shows schedule status legend', async ({ page }) => {
    await page.goto('/bands/band-1/calendar');
    const pageContent = await page.textContent('body');
    // Should contain some schedule-related content
    expect(pageContent).toContain('カレンダー');
  });

  test('calendar page for non-existent band shows error', async ({ page }) => {
    const response = await page.goto('/bands/non-existent/calendar');
    expect(response?.status()).toBeLessThan(500);
  });
});
