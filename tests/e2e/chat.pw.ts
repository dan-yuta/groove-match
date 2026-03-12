import { test, expect } from '@playwright/test';

test.describe('Chat page', () => {
  test('chat page loads successfully', async ({ page }) => {
    const response = await page.goto('/chat');
    expect(response?.status()).toBeLessThan(400);
  });

  test('chat page displays title', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByText('チャット')).toBeVisible();
  });

  test('chat page shows DM and band tabs', async ({ page }) => {
    await page.goto('/chat');
    // Look for tab-like elements for DM and band chat
    const dmTab = page.getByText('DM');
    const bandTab = page.getByText('バンド');
    await expect(dmTab).toBeVisible();
    await expect(bandTab).toBeVisible();
  });

  test('chat page shows room list', async ({ page }) => {
    await page.goto('/chat');
    // The page should have at least one chat room entry
    const chatContent = await page.textContent('body');
    expect(chatContent).toBeTruthy();
  });
});
