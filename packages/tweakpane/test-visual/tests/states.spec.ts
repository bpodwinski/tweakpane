import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/test-visual/fixtures/blades.html');
  await page.waitForSelector('body[data-ready="true"]');
});

test('folder collapsed', async ({ page }) => {
  await page.getByRole('button', { name: 'Folder' }).click();
  await expect(page.locator('#pane')).toHaveScreenshot(
    'blades-folder-collapsed.png',
  );
});

test('button hover', async ({ page }) => {
  await page.getByRole('button', { name: 'Action' }).hover();
  await expect(page.locator('#pane')).toHaveScreenshot(
    'blades-button-hover.png',
  );
});

test('input focus', async ({ page }) => {
  // The tab page's "value" number input — the second textbox on the page
  // (the first is the folder's "brightness" slider input).
  await page.getByRole('textbox').nth(1).focus();
  await expect(page.locator('#pane')).toHaveScreenshot(
    'blades-input-focus.png',
  );
});
