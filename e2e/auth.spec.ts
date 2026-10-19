import { expect, test, type Page } from '@playwright/test';

import { ADMIN, LEARNER, mockSupabase, type MockUser } from './supabaseMock';

async function signIn(page: Page, user: MockUser, path = '/sign-in') {
  await page.goto(path);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.describe('sign-in and sign-up', () => {
  test('a learner signs in and returns to the dashboard', async ({ page }) => {
    await mockSupabase(page);
    await signIn(page, LEARNER);
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/settings/account');
    await expect(page.getByText(LEARNER.email)).toBeVisible();
  });

  test('wrong credentials show a clear error and stay on the form', async ({ page }) => {
    await mockSupabase(page);
    await signIn(page, { ...LEARNER, password: 'wrong-password1' });
    await expect(page.getByRole('alert')).toContainText('do not match an account');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('sign-up validates input, then asks the learner to confirm their email', async ({ page }) => {
    const state = await mockSupabase(page);
    await page.goto('/sign-up');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();

    await page.getByLabel('Display name').fill('Grace');
    await page.getByLabel('Email').fill('grace@example.com');
    await page.getByLabel('Password', { exact: true }).fill('hopper1906');
    await page.getByLabel('Confirm password').fill('hopper1907');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();

    await page.getByLabel('Confirm password').fill('hopper1906');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible();
    expect(state.signUps).toEqual([{ email: 'grace@example.com', displayName: 'Grace' }]);
  });

  test('password reset never reveals whether an account exists', async ({ page }) => {
    const state = await mockSupabase(page);
    await page.goto('/forgot-password');
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await expect(page.getByText(/If an account exists for that address/)).toBeVisible();
    expect(state.resetRequests).toEqual(['nobody@example.com']);
  });

  test('sign-in only redirects to paths inside the app', async ({ page }) => {
    await mockSupabase(page);
    await signIn(page, LEARNER, '/sign-in?redirect=https%3A%2F%2Fevil.example');
    await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$|localhost:\d+\/$/);
  });
});

test.describe('admin dashboard', () => {
  test('signed-out visitors are asked to sign in', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/admin');
    await expect(page.getByText('Sign in to continue')).toBeVisible();
  });

  test('learners without admin rights are refused and see no admin menu', async ({ page }, info) => {
    const state = await mockSupabase(page);
    await signIn(page, LEARNER);
    await expect(page).toHaveURL(/\/$/);
    if (info.project.name === 'desktop') await expect(page.getByRole('navigation').getByText('Admin', { exact: true })).toHaveCount(0);
    await page.goto('/admin');
    await expect(page.getByText('Admin access required')).toBeVisible();
    expect(state.rpcCalls.filter((f) => f !== 'is_admin')).toEqual([]);
  });

  test('an admin signs in and sees overview, learners and content health', async ({ page }, info) => {
    const state = await mockSupabase(page);
    await signIn(page, ADMIN, '/sign-in?redirect=%2Fadmin');
    await expect(page).toHaveURL(/\/admin$/);
    if (info.project.name === 'desktop') await expect(page.getByRole('navigation').getByText('Admin', { exact: true })).toBeVisible();

    await expect(page.getByLabel(/^Learners: 128/)).toBeVisible();
    await expect(page.getByLabel(/^Average mastery: 42%/)).toBeVisible();
    await expect(page.getByText('Java Fundamentals and the Execution Lifecycle')).toBeVisible();

    await page.getByRole('tab', { name: 'Learners' }).click();
    await expect(page.getByText(LEARNER.email)).toBeVisible();
    await page.getByLabel('Search learners').fill('learner');
    await expect(page.getByText(ADMIN.email)).toHaveCount(0);
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Make admin' }).click();
    await expect.poll(() => state.adminChanges).toEqual([{ target: LEARNER.id, makeAdmin: true }]);

    await page.getByRole('tab', { name: 'Content' }).click();
    await expect(page.getByText('What does javac Main.java produce?')).toBeVisible();
    await expect(page.getByText('35% correct')).toBeVisible();
  });
});
