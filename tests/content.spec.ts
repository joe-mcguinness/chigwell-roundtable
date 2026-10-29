import { test, expect } from '@playwright/test';
import { pages, club } from './site';

test.describe('club details', () => {
  test('meeting days are on every page footer', async ({ page }) => {
    for (const p of pages) {
      await page.goto(p.path);
      await expect(page.getByRole('contentinfo')).toContainText(club.meetings);
    }
  });

  test('meeting days are near the top of the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero')).toContainText(club.meetings);
  });

  test('about and contact pages mention meeting days', async ({ page }) => {
    for (const path of ['/about/', '/contact/']) {
      await page.goto(path);
      await expect(page.getByRole('main')).toContainText(club.meetings);
    }
  });

  test('age range is 18 to 45', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.getByRole('main')).toContainText('18 to 45');
  });

  test('copy has no em dashes', async ({ page }) => {
    for (const p of pages) {
      await page.goto(p.path);
      expect(await page.locator('body').innerText(), p.path).not.toContain('—');
    }
  });
});

test.describe('contact links', () => {
  test('email address is a working mailto link on every page', async ({ page }) => {
    for (const p of pages) {
      await page.goto(p.path);
      const link = page.getByRole('contentinfo').getByRole('link', { name: club.email });
      await expect(link).toHaveAttribute('href', `mailto:${club.email}`);
    }
  });

  test('contact page lists email, Facebook and Instagram', async ({ page }) => {
    await page.goto('/contact/');
    const main = page.getByRole('main');
    await expect(main.getByRole('link', { name: /Email/ }).first()).toHaveAttribute('href', `mailto:${club.email}`);
    await expect(main.getByRole('link', { name: /Facebook/ })).toHaveAttribute('href', club.facebook);
    await expect(main.getByRole('link', { name: /Instagram/ })).toHaveAttribute('href', club.instagram);
  });

  test('contact page links to Round Table GB & I and RTI', async ({ page }) => {
    await page.goto('/contact/');
    const main = page.getByRole('main');
    await expect(main.getByRole('link', { name: /Round Table Britain & Ireland/ })).toHaveAttribute('href', club.rtbi);
    await expect(main.getByRole('link', { name: /Round Table International/ })).toHaveAttribute('href', club.rti);
  });

  test('external links open in a new tab safely', async ({ page }) => {
    for (const p of pages) {
      await page.goto(p.path);
      const external = page.locator('a[href^="http"]');
      const count = await external.count();
      for (let i = 0; i < count; i++) {
        const a = external.nth(i);
        await expect(a, await a.getAttribute('href') ?? '').toHaveAttribute('target', '_blank');
        await expect(a).toHaveAttribute('rel', /noopener/);
      }
    }
  });

  test('social links all point at the right accounts', async ({ page }) => {
    for (const p of pages) {
      await page.goto(p.path);
      const hrefs = await page.locator('a[href*="facebook.com"], a[href*="instagram.com"]').evaluateAll((as) =>
        as.map((a) => a.getAttribute('href')),
      );
      for (const h of hrefs) expect([club.facebook, club.instagram], p.path).toContain(h);
    }
  });
});

test.describe('page metadata', () => {
  for (const p of pages) {
    test(`${p.path} has description, canonical and share tags`, async ({ page }) => {
      await page.goto(p.path);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://chigwellroundtable.co.uk${p.path}`,
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', p.title);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /rondel\.png$/);
      await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /favicon/);
    });
  }
});
