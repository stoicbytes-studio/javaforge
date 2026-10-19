import { expect, test } from '@playwright/test';

import { LEARNER, mockSupabase } from './supabaseMock';

test.describe('landing page and access control', () => {
  test('launching the app shows the landing page with sign-up and sign-in', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome$/);
    await expect(page.getByRole('heading', { name: 'Learn Java the way engineers actually use it' })).toBeVisible();
    await expect(page.getByText('Honest by design')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create free account' }).first()).toBeVisible();
    // The sidebar and the learning portal are not available to signed-out visitors.
    await expect(page.getByRole('navigation')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'No learning evidence yet' })).toHaveCount(0);
  });

  test('call-to-action buttons lead to sign-up and sign-in', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/welcome');
    await page.getByRole('button', { name: 'Create free account' }).first().click();
    await expect(page).toHaveURL(/\/sign-up$/);
    await page.goto('/welcome');
    await page.getByRole('button', { name: 'Sign in' }).first().click();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  for (const path of ['/learn', '/learn/fundamentals/f-first-program', '/practice', '/interview', '/progress', '/settings']) {
    test(`signed-out visitors opening ${path} are sent to the landing page`, async ({ page }) => {
      await mockSupabase(page);
      await page.goto(path);
      await expect(page).toHaveURL(/\/welcome$/);
    });
  }

  test('after signing in the learner reaches the learning portal, and the landing page is skipped', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill(LEARNER.email);
    await page.getByLabel('Password').fill(LEARNER.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'No learning evidence yet' })).toBeVisible();

    await page.goto('/welcome');
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/learn');
    await expect(page.getByRole('heading', { name: 'Learning roadmap' })).toBeVisible();
  });

  test('signing out returns to the landing page and locks the portal again', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill(LEARNER.email);
    await page.getByLabel('Password').fill(LEARNER.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: 'No learning evidence yet' })).toBeVisible();
    await page.goto('/settings/account');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/welcome$/);
    await page.goto('/learn');
    await expect(page).toHaveURL(/\/welcome$/);
  });
});
