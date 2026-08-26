import { expect, test } from '@playwright/test';

test('blades panel', async ({ page }) => {
  await page.goto('/test-visual/fixtures/blades.html');
  await page.waitForSelector('body[data-ready="true"]');
  await expect(page.locator('#pane')).toHaveScreenshot('blades-panel.png');
});
