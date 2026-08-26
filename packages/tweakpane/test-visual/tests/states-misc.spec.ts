import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/test-visual/fixtures/misc-blades.html');
  await page.waitForSelector('body[data-ready="true"]');
});

test('checkbox unchecked', async ({ page }) => {
  // The native checkbox input is visually hidden behind a custom marker
  // element (zero-size, positioned outside the viewport), so a real mouse
  // click can't reach it — dispatch the DOM event directly instead. This
  // still toggles `checked` and fires `change` exactly as a real click would.
  await page.getByRole('checkbox').dispatchEvent('click');
  await expect(page.locator('#pane')).toHaveScreenshot(
    'misc-checkbox-unchecked.png',
  );
});
