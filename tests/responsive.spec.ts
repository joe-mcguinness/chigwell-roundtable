import { test, expect } from '@playwright/test';
import { pages } from './site';

const widths = [320, 375, 768, 1024, 1440];

test.describe('layout at different screen widths', () => {
  // The viewport is set per test, so run this once rather than per device project.
  test.skip(({ isMobile }) => isMobile, 'covered by desktop project');

  for (const width of widths) {
    test(`no sideways scrolling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const p of pages) {
        await page.goto(p.path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${p.path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test('navigation fits on a small phone', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    for (const name of ['Home', 'About', 'Contact']) {
      await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name, exact: true })).toBeInViewport();
    }
  });
});

test.describe('touch targets', () => {
  test('buttons and nav links are at least 24px tall', async ({ page }) => {
    for (const p of pages) {
      await page.goto(p.path);
      const small = await page.locator('.nav a, .btn').evaluateAll((els) =>
        els.filter((e) => e.getBoundingClientRect().height < 24).map((e) => e.textContent?.trim()),
      );
      expect(small, p.path).toEqual([]);
    }
  });
});
