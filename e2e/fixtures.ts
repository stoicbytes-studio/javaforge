import { test as base, expect } from '@playwright/test';

import { LEARNER, mockSupabase, type MockState, type MockUser } from './supabaseMock';

/**
 * With accounts configured the learning portal needs a session, so most tests
 * run as a signed-in learner (against the mocked Supabase). `signedOut` tests
 * use the plain `test` from Playwright plus `mockSupabase` themselves.
 */
export const test = base.extend<{ supabase: MockState; user: MockUser }>({
  user: [LEARNER, { option: true }],
  supabase: async ({ page, user }, use) => {
    const state = await mockSupabase(page);
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: /No learning evidence yet|Good (morning|afternoon|evening)/ }).first()).toBeVisible();
    await use(state);
  },
});

export { expect };
