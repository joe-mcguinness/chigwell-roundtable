import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pages } from './site';

const allPages = [...pages.map((p) => p.path), '/no-such-page'];

test.describe('axe accessibility scan (WCAG 2.2 AA)', () => {
  for (const path of allPages) {
    test(path, async ({ page }) => {
      // Reduced motion shows every section straight away, so axe checks the final colours.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      const summary = results.violations.map(
        (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`,
      );
      expect(summary, summary.join('\n')).toEqual([]);
    });
  }
});

test.describe('keyboard', () => {
  test('first Tab reveals the skip link, which jumps to the content', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Safari skips links on Tab by default');
    await page.goto('/about/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('every link can be reached with Tab and shows a focus outline', async ({ page }) => {
    await page.goto('/contact/');
    const total = await page.locator('a[href]').count();
    for (let i = 0; i < total + 2; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        el.dataset.tabbed = 'yes';
        const s = getComputedStyle(el);
        return { text: el.textContent?.trim().slice(0, 40), outline: s.outlineStyle !== 'none' && s.outlineWidth !== '0px' };
      });
      if (info) expect(info.outline, `no focus outline on "${info.text}"`).toBe(true);
    }
    await expect(page.locator('a[href]:not([data-tabbed])')).toHaveCount(0);
  });
});

test.describe('images and media', () => {
  for (const path of pages.map((p) => p.path)) {
    test(`${path}: every image has alt text (empty is fine for decoration)`, async ({ page }) => {
      await page.goto(path);
      const missing = await page.locator('img:not([alt])').count();
      expect(missing).toBe(0);
    });
  }

  test('decorative SVG icons are hidden from screen readers', async ({ page }) => {
    for (const p of pages) {
      await page.goto(p.path);
      expect(await page.locator('svg:not([aria-hidden="true"])').count(), p.path).toBe(0);
    }
  });
});

test.describe('motion', () => {
  test('content is visible straight away with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const hidden = await page.locator('.reveal').evaluateAll((els) =>
      els.filter((e) => getComputedStyle(e).opacity !== '1').length,
    );
    expect(hidden).toBe(0);
  });

  test('sections fade in once scrolled to', async ({ page }) => {
    await page.goto('/');
    const last = page.locator('.reveal').last();
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveClass(/\bin\b/);
  });
});
