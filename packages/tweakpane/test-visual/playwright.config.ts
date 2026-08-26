import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const dirname = path.dirname(fileURLToPath(import.meta.url));
// Resolved from this file's own location rather than process.cwd() — npx's
// working directory doesn't reliably match the shell's cwd on Windows.
const packageRoot = path.resolve(dirname, '..');

export default defineConfig({
  testDir: './tests',
  // Pinned to this file's own directory — process.cwd() at invocation time
  // isn't reliable (see the packageRoot comment below), so leaving these as
  // relative defaults can land test-results/playwright-report a level up.
  outputDir: path.join(dirname, 'test-results'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never', outputFolder: path.join(dirname, 'playwright-report') }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 400, height: 400 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  webServer: {
    // Serves the package root (absolute path) — fixtures resolve the built
    // bundle at ../../docs/assets/tweakpane.js relative to themselves.
    command: `npx http-server -c-1 ${JSON.stringify(packageRoot)} -p 4173 -a 127.0.0.1`,
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
