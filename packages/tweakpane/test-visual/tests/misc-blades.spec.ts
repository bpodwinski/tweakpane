import { expect, test } from '@playwright/test';

test('misc blades panel', async ({ page }) => {
  await page.goto('/test-visual/fixtures/misc-blades.html');
  await page.waitForSelector('body[data-ready="true"]');
  await expect(page.locator('#pane')).toHaveScreenshot('misc-blades-panel.png');
});
