import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/test-visual/fixtures/themes.html');
  await page.waitForSelector('body[data-ready="true"]');
});

test('light theme panel', async ({ page }) => {
  await expect(page.locator('#pane-light')).toHaveScreenshot('theme-light.png');
});

test('jetblack theme panel', async ({ page }) => {
  await expect(page.locator('#pane-jetblack')).toHaveScreenshot('theme-jetblack.png');
});
