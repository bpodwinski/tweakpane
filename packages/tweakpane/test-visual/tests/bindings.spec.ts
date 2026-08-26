import { expect, test } from '@playwright/test';

test('bindings panel', async ({ page }) => {
  await page.goto('/test-visual/fixtures/bindings.html');
  await page.waitForSelector('body[data-ready="true"]');
  await expect(page.locator('#pane')).toHaveScreenshot('bindings-panel.png');
});
