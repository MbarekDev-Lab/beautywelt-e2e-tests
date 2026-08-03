import type { Locator, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/pom-fixtures';

type LocatorCandidate = {
  readonly name: string;
  readonly locator: () => Locator;
};

const APPROVED_STAGING_HOSTS = new Set([
  'haarpflege-beautyshop.de',
  'www.haarpflege-beautyshop.de',
]);

const searchTerm = process.env.STAGING_SEARCH_TERM ?? 'shampoo';
const productName = process.env.STAGING_PRODUCT_NAME ?? '';

function requireAuthorizedStaging(baseURL: string | undefined): void {
  if (!baseURL) {
    throw new Error('BASE_URL is required.');
  }

  const hostname = new URL(baseURL).hostname.toLowerCase();

  if (!APPROVED_STAGING_HOSTS.has(hostname)) {
    throw new Error(
      `This test may run only against the approved staging host. Current host: ${hostname}`,
    );
  }

  if (process.env.TARGET_ENV !== 'staging') {
    throw new Error('This test requires TARGET_ENV=staging.');
  }

  if (process.env.ALLOW_STATE_CHANGES !== 'true') {
    throw new Error('This test requires ALLOW_STATE_CHANGES=true.');
  }

  if (!process.env.TEST_AUTHORIZATION_REFERENCE) {
    throw new Error('This test requires TEST_AUTHORIZATION_REFERENCE.');
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findVisibleLocator(
  candidates: readonly LocatorCandidate[],
  purpose: string,
): Promise<Locator> {
  for (const candidate of candidates) {
    const locator = candidate.locator();

    if (await locator.isVisible({ timeout: 1500 }).catch(() => false)) {
      return locator;
    }
  }

  const triedLocators = candidates
    .map((candidate) => candidate.name)
    .join(', ');

  throw new Error(`Could not find ${purpose}. Tried: ${triedLocators}`);
}

async function dismissCookieBannerIfPresent(page: Page): Promise<void> {
  const rejectOptionalCookies = page.getByRole('button', {
    name: /ablehnen|nur notwendige|notwendige cookies/i,
  });

  if (
    await rejectOptionalCookies.isVisible({ timeout: 3000 }).catch(() => false)
  ) {
    await rejectOptionalCookies.click();
  }
}

async function findSearchInput(page: Page): Promise<Locator> {
  return findVisibleLocator(
    [
      {
        name: 'textbox with German search name',
        locator: () =>
          page.getByRole('textbox', {
            name: /suche|suchen|suchbegriff|marken/i,
          }),
      },
      {
        name: 'placeholder search input',
        locator: () =>
          page.getByPlaceholder(/suche|suchen|suchbegriff|marken/i),
      },
      {
        name: 'input type search',
        locator: () => page.locator('input[type="search"]'),
      },
      {
        name: 'common search input names',
        locator: () =>
          page.locator(
            'input[name="qs"], input[name="q"], input[name="search"], input[name="suchbegriff"]',
          ),
      },
    ],
    'search input',
  );
}

async function submitSearch(page: Page, input: Locator): Promise<void> {
  await input.fill(searchTerm);

  const searchButton = page.getByRole('button', {
    name: /suchen|suche/i,
  });

  if (await searchButton.isVisible({ timeout: 1500 }).catch(() => false)) {
    await searchButton.click();
    return;
  }

  await input.press('Enter');
}

async function openConfiguredProduct(page: Page): Promise<void> {
  if (!productName) {
    throw new Error(
      'STAGING_PRODUCT_NAME is required for this staging navigation flow. Add a product visible on the staging domain to .env.staging.',
    );
  }

  const productLink = page.getByRole('link', {
    name: new RegExp(escapeRegExp(productName), 'i'),
  });

  await expect(productLink).toBeVisible();
  await productLink.click();
}

async function addCurrentProductToCart(page: Page): Promise<void> {
  const addToCartControl = await findVisibleLocator(
    [
      {
        name: 'button named In den Warenkorb',
        locator: () =>
          page.getByRole('button', {
            name: /in den warenkorb|warenkorb/i,
          }),
      },
      {
        name: 'link named In den Warenkorb',
        locator: () =>
          page.getByRole('link', {
            name: /in den warenkorb|warenkorb/i,
          }),
      },
      {
        name: 'submit button containing Warenkorb',
        locator: () =>
          page.locator('button[type="submit"]').filter({
            hasText: /warenkorb/i,
          }),
      },
    ],
    'add-to-cart control',
  );

  await expect(addToCartControl).toBeEnabled();
  await addToCartControl.click();
}

async function goToCart(page: Page): Promise<void> {
  const cartNavigation = await findVisibleLocator(
    [
      {
        name: 'button named Zum Warenkorb',
        locator: () =>
          page.getByRole('button', {
            name: /zum warenkorb|warenkorb anzeigen|warenkorb/i,
          }),
      },
      {
        name: 'link named Zum Warenkorb',
        locator: () =>
          page.getByRole('link', {
            name: /zum warenkorb|warenkorb anzeigen|warenkorb/i,
          }),
      },
    ],
    'cart navigation control',
  );

  await cartNavigation.click();
}

async function goToCheckout(page: Page): Promise<void> {
  const checkoutNavigation = await findVisibleLocator(
    [
      {
        name: 'link named Zur Kasse',
        locator: () =>
          page.getByRole('link', {
            name: /zur kasse|kasse|checkout/i,
          }),
      },
      {
        name: 'button named Zur Kasse',
        locator: () =>
          page.getByRole('button', {
            name: /zur kasse|kasse|checkout/i,
          }),
      },
    ],
    'checkout navigation control',
  );

  await checkoutNavigation.click();
}

test.describe('Navigation flow @staging @stateful @requires-authorization', () => {
  test.beforeEach(async ({ baseURL }) => {
    requireAuthorizedStaging(baseURL);
  });

  test('runs product-to-checkout navigation on approved staging domain only', async ({
    page,
  }) => {
    await page.goto('/');
    await dismissCookieBannerIfPresent(page);

    const searchInput = await findSearchInput(page);

    await expect(searchInput).toBeVisible();
    await submitSearch(page, searchInput);

    await openConfiguredProduct(page);
    await addCurrentProductToCart(page);
    await goToCart(page);
    await goToCheckout(page);

    await expect(
      page.getByText(/anmelden|kundendaten|sie sind noch kein kunde/i),
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: /anmelden|kundendaten abschicken|weiter/i,
      }),
    ).toBeVisible();

    // Important:
    // This staging test intentionally stops before submitting customer data,
    // selecting payment, or confirming an order.
  });
});
