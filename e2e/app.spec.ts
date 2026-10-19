import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

/** Lessons open on the Concept view; practice lives in the Practice tab (phone) or the lesson view (desktop). */
async function openPractice(page: Page) {
  const desktopSwitch = page.getByRole('tab', { name: 'Lesson & practice' });
  const phoneTab = page.getByRole('tab', { name: /^Practice/ }).first();
  await expect(desktopSwitch.or(phoneTab)).toBeVisible();
  if (await desktopSwitch.isVisible()) await desktopSwitch.click();
  else await phoneTab.click();
}

const isMobile = (name: string) => name === 'mobile';

test.describe('shell and navigation', () => {
  test('dashboard shows an honest empty state and a first mission for a new learner', async ({ page, supabase: _ }) => {
    await page.goto('/');
    // No invented mastery, streaks or XP before the learner has demonstrated anything.
    await expect(page.getByRole('heading', { name: 'No learning evidence yet' })).toBeVisible();
    await page.getByRole('link', { name: /Today's mission/ }).click();
    await expect(page).toHaveURL(/\/learn\/fundamentals\/f-first-program$/);
  });

  test('uses a sidebar on desktop and bottom tabs on mobile', async ({ page, supabase: _ }, info) => {
    await page.goto('/');
    if (isMobile(info.project.name)) {
      await expect(page.getByRole('tablist')).toBeVisible();
      await expect(page.getByRole('navigation')).toHaveCount(0);
    } else {
      await expect(page.getByRole('navigation')).toBeVisible();
      await expect(page.getByRole('navigation').getByText('Interview Arena')).toBeVisible();
    }
  });

  test('curriculum lists all seventeen modules', async ({ page, supabase: _ }) => {
    await page.goto('/learn');
    await expect(page.getByRole('heading', { name: 'Learning roadmap' })).toBeVisible();
    for (let n = 1; n <= 17; n++) await expect(page.getByText(`Module ${n}`, { exact: true })).toBeVisible();
  });

  test('unknown routes show a not-found screen', async ({ page, supabase: _ }) => {
    await page.goto('/definitely-not-a-route');
    await expect(page.getByText(/not found/i).first()).toBeVisible();
  });
});

test.describe('learning loop', () => {
  test('answering a knowledge check records evidence and updates progress', async ({ page, supabase: _ }) => {
    await page.goto('/learn/fundamentals/f-first-program');
    await openPractice(page);
    await page.getByText('Main.class containing platform-independent bytecode').click();
    await page.getByRole('button', { name: 'Check answer' }).first().click();
    await expect(page.getByText(/correct/i).first()).toBeVisible();

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'No learning evidence yet' })).toHaveCount(0);
  });

  test('progress survives a reload (local-first persistence)', async ({ page, supabase: _ }) => {
    await page.goto('/learn/fundamentals/f-first-program');
    await openPractice(page);
    await page.getByText('Main.class containing platform-independent bytecode').click();
    await page.getByRole('button', { name: 'Check answer' }).first().click();
    await page.reload();
    await openPractice(page);
    await expect(page.getByText(/correct/i).first()).toBeVisible();
  });
});

test.describe('honesty guarantees', () => {
  test('playground explains simulation mode when no executor is configured', async ({ page, supabase: _ }) => {
    await page.goto('/practice');
    await expect(page.getByText(/simulation/i).first()).toBeVisible();
  });

  test('Java versions page separates final and preview features', async ({ page, supabase: _ }) => {
    await page.goto('/learn/java-versions');
    await expect(page.getByText(/Java 21/).first()).toBeVisible();
    await expect(page.getByText(/preview/i).first()).toBeVisible();
  });

  test('JVM lab states that visualisations are simplified models', async ({ page, supabase: _ }) => {
    await page.goto('/jvm-lab');
    await expect(page.getByText(/simplified|model/i).first()).toBeVisible();
  });
});
