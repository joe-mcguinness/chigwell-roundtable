import { test, expect } from '@playwright/test';
import { pages } from './site';

test.describe('header navigation', () => {
  for (const from of pages) {
    for (const to of pages) {
      test(`${from.nav} -> ${to.nav}`, async ({ page }) => {
        await page.goto(from.path);
        await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: to.nav, exact: true }).click();
        await expect(page).toHaveURL(to.path);
        await expect(page).toHaveTitle(to.title);
      });
    }
  }

  for (const p of pages) {
    test(`marks ${p.nav} as the current page`, async ({ page }) => {
      await page.goto(p.path);
      const nav = page.getByRole('navigation', { name: 'Main' });
      await expect(nav.getByRole('link', { name: p.nav, exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    });
  }

  test('logo takes you home', async ({ page }) => {
    await page.goto('/contact/');
    await page.getByRole('banner').getByRole('link', { name: 'RoundTable Chigwell, home' }).click();
    await expect(page).toHaveURL('/');
  });

  test('header stays visible after scrolling', async ({ page }) => {
    await page.goto('/');
    await page.mouse.wheel(0, 2000);
    await expect(page.getByRole('banner')).toBeInViewport();
  });
});

test.describe('footer navigation', () => {
  for (const to of pages) {
    test(`footer link to ${to.nav}`, async ({ page }) => {
      await page.goto('/about/');
      await page.getByRole('contentinfo').getByRole('link', { name: to.nav, exact: true }).click();
      await expect(page).toHaveURL(to.path);
    });
  }
});

test.describe('call to action buttons', () => {
  test('"Come and say hello" goes to contact', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Come and say hello' }).click();
    await expect(page).toHaveURL('/contact/');
  });

  test('"What we\'re about" goes to about', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: "What we're about" }).click();
    await expect(page).toHaveURL('/about/');
  });

  test('"Get in touch" on about goes to contact', async ({ page }) => {
    await page.goto('/about/');
    await page.getByRole('main').getByRole('link', { name: 'Get in touch' }).click();
    await expect(page).toHaveURL('/contact/');
  });

  test('404 page links back home', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(page).toHaveURL('/');
  });
});
