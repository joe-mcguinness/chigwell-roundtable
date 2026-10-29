import { test, expect } from '@playwright/test';
import { pages, isLive } from './site';

test.describe('pages', () => {
  for (const p of pages) {
    test(`${p.path} loads cleanly`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      const failed: string[] = [];
      page.on('requestfailed', (r) => {
        // Google Fonts may be blocked in some environments; the site falls back to system fonts.
        if (!r.url().includes('fonts.g')) failed.push(r.url());
      });

      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(p.title);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.h1);
      await page.waitForLoadState('networkidle');
      expect(failed, 'failed requests').toEqual([]);
      // Resource failures are already covered by the failed-request check above.
      expect(errors.filter((e) => !e.startsWith('Failed to load resource')), 'console errors').toEqual([]);
    });
  }

  test('unknown pages return the custom 404', async ({ page }) => {
    const res = await page.goto('/no-such-page');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/left the table/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });
});

test.describe('every internal link and asset', () => {
  test('returns 200', async ({ page, request }) => {
    const found = new Set<string>();
    for (const p of pages) {
      await page.goto(p.path);
      const urls = await page.evaluate(() =>
        [
          ...[...document.querySelectorAll('a[href]')].map((a) => (a as HTMLAnchorElement).href),
          ...[...document.querySelectorAll('img[src]')].map((i) => (i as HTMLImageElement).src),
          ...[...document.querySelectorAll('link[href]')].map((l) => (l as HTMLLinkElement).href),
          ...[...document.querySelectorAll('script[src]')].map((s) => (s as HTMLScriptElement).src),
        ].filter((u) => u.startsWith(location.origin)),
      );
      urls.forEach((u) => found.add(u.split('#')[0]));
    }
    expect(found.size).toBeGreaterThan(5);
    for (const url of found) {
      const res = await request.get(url);
      expect(res.status(), url).toBe(200);
    }
  });

  test('images actually render', async ({ page }) => {
    for (const p of pages) {
      await page.goto(p.path);
      const broken = await page.evaluate(() =>
        [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
      );
      expect(broken, p.path).toEqual([]);
    }
  });
});

test.describe('live site only', () => {
  test.skip(!isLive, 'Set BASE_URL to the live site to run these');

  test('http redirects to https', async ({ request }) => {
    const res = await request.get('http://chigwellroundtable.co.uk/', { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()['location']).toMatch(/^https:\/\/chigwellroundtable\.co\.uk\/?$/);
  });

  test('www redirects to the main domain', async ({ page }) => {
    await page.goto('https://www.chigwellroundtable.co.uk/about/');
    await expect(page).toHaveURL('https://chigwellroundtable.co.uk/about/');
  });

  test('addresses without a trailing slash still work', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about\/$/);
    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact\/$/);
  });
});
