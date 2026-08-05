import type { Locator, Page } from '@playwright/test';
import { test, expect } from '../../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

/*
import type { Locator, Page } from '@playwright/test';
import { test, expect } from '../../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

function requireAuthorizedStaging(baseURL: string | undefined): void {
  if (!baseURL) {
    throw new Error('baseURL is required.');
  }

  if (!isApprovedStagingHost(baseURL)) {
    throw new Error(
      `Mobile stateful tests require an approved staging host. Current host: ${
        new URL(baseURL).hostname
      }`,
    );
  }

  if (process.env.TARGET_ENV !== 'staging') {
    throw new Error('Mobile stateful tests require TARGET_ENV=staging.');
  }

  if (process.env.ALLOW_STATE_CHANGES !== 'true') {
    throw new Error('Mobile stateful tests require ALLOW_STATE_CHANGES=true.');
  }

  if (!process.env.TEST_AUTHORIZATION_REFERENCE?.trim()) {
    throw new Error(
      'Mobile stateful tests require TEST_AUTHORIZATION_REFERENCE.',
    );
  }
}*/

async function assertAuthorizedPageLoaded(page: Page): Promise<void> {
  await expect(
    page.getByRole('heading', { name: /unauthorized/i }),
  ).toHaveCount(0);

  await expect(page.locator('body')).not.toContainText(
    /could not verify that you are authorized/i,
  );
}

async function findVisibleCandidate(
  candidates: readonly Locator[],
  purpose: string,
): Promise<Locator> {
  for (const candidate of candidates) {
    if (await candidate.isVisible({ timeout: 1500 }).catch(() => false)) {
      return candidate;
    }
  }

  throw new Error(`Could not find a visible ${purpose}.`);
}

async function openMobileNavigation(page: Page): Promise<void> {
  const menuButton = await findVisibleCandidate(
    [
      page.getByRole('button', {
        name: /menü|menu|navigation|kategorien/i,
      }),
      page.getByTitle(/menü|menu|navigation|kategorien/i),
      page.locator(
        'button[aria-label*="menu" i], button[aria-label*="menü" i]',
      ),
    ],
    'mobile navigation control',
  );

  await menuButton.click();
}

async function openConfiguredProduct(page: Page): Promise<void> {
  const productName = process.env.STAGING_PRODUCT_NAME?.trim();

  if (!productName) {
    throw new Error('STAGING_PRODUCT_NAME is required in .env.staging.');
  }

  const productLink = page.getByRole('link', {
    name: new RegExp(escapeRegExp(productName), 'i'),
  });

  await expect(productLink).toBeVisible();
  await productLink.click();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function addProductToCart(page: Page): Promise<void> {
  const addToCartButton = page.getByRole('button', {
    name: /in den warenkorb/i,
  });

  await expect(addToCartButton).toBeVisible();
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();
}

async function openCart(page: Page): Promise<void> {
  const cartControl = await findVisibleCandidate(
    [
      page.getByRole('button', { name: /zum warenkorb/i }),
      page.getByRole('link', { name: /zum warenkorb|warenkorb/i }),
    ],
    'cart navigation control',
  );

  await cartControl.click();
}

async function openCheckout(page: Page): Promise<void> {
  const checkoutControl = await findVisibleCandidate(
    [
      page.getByRole('link', { name: /zur kasse|checkout/i }),
      page.getByRole('button', { name: /zur kasse|checkout/i }),
    ],
    'checkout navigation control',
  );

  await checkoutControl.click();
}

test.describe('Mobile Staging Navigation @staging @stateful @requires-authorization', () => {
  test.beforeEach(async ({ baseURL }): Promise<void> => {
    requireAuthorizedStaging(baseURL);
  });

  test('navigates from product to checkout entry on mobile', async ({
    page,
    homePage,
  }): Promise<void> => {
    await homePage.gotoHome();
    await assertAuthorizedPageLoaded(page);
    await homePage.cookieBanner.dismissIfPresent();

    await openMobileNavigation(page);

    await openConfiguredProduct(page);
    await addProductToCart(page);
    await openCart(page);
    await openCheckout(page);

    await expect(
      page.getByRole('button', {
        name: /anmelden|kundendaten abschicken|weiter/i,
      }),
    ).toBeVisible();
  });
});
