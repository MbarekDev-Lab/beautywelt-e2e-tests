import type { Locator, Page, Response } from '@playwright/test';
import { test, expect } from '../../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

type LocatorCandidate = {
  readonly description: string;
  readonly create: () => Locator;
};

type NavigationTestData = {
  readonly searchTerm: string;
  readonly productName: string;
};

const LOCATOR_PROBE_TIMEOUT_MS = 1_500;

function requireEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} is required for the staging navigation test. Configure it in .env.staging.`,
    );
  }

  return value;
}

function loadNavigationTestData(): NavigationTestData {
  return {
    searchTerm: requireEnvironmentValue('STAGING_SEARCH_TERM'),
    productName: requireEnvironmentValue('STAGING_PRODUCT_NAME'),
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exactTextPattern(value: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(value)}\\s*$`, 'i');
}

async function assertAuthorizedApplicationLoaded(page: Page): Promise<void> {
  await expect(
    page.getByRole('heading', {
      name: /unauthorized/i,
    }),
  ).toHaveCount(0);

  await expect(page.locator('body')).not.toContainText(
    /could not verify that you are authorized/i,
  );
}

async function assertSuccessfulDocumentResponse(
  response: Response | null,
  purpose: string,
): Promise<void> {
  if (!response) {
    throw new Error(`${purpose} returned no document response.`);
  }

  expect(
    response.status(),
    `${purpose} returned HTTP ${response.status()}.`,
  ).toBeLessThan(400);
}

async function findSingleVisibleLocator(
  candidates: readonly LocatorCandidate[],
  purpose: string,
): Promise<Locator> {
  const attemptedCandidates: string[] = [];

  for (const candidate of candidates) {
    attemptedCandidates.push(candidate.description);

    const locator = candidate.create();
    const count = await locator.count();
    const visibleMatches: Locator[] = [];

    for (let index = 0; index < count; index += 1) {
      const match = locator.nth(index);

      const isVisible = await match
        .isVisible({
          timeout: LOCATOR_PROBE_TIMEOUT_MS,
        })
        .catch(() => false);

      if (isVisible) {
        visibleMatches.push(match);
      }
    }

    if (visibleMatches.length === 1) {
      const visibleMatch = visibleMatches[0];

      if (!visibleMatch) {
        throw new Error(`Internal locator resolution failure for ${purpose}.`);
      }

      return visibleMatch;
    }

    if (visibleMatches.length > 1) {
      throw new Error(
        `Ambiguous ${purpose}: "${candidate.description}" matched ${visibleMatches.length} visible elements.`,
      );
    }
  }

  throw new Error(
    `Could not find a visible ${purpose}. Tried: ${attemptedCandidates.join(', ')}.`,
  );
}

async function dismissCookieBannerIfPresent(page: Page): Promise<void> {
  const rejectButton = page.getByRole('button', {
    name: /alle ablehnen|nur notwendige|notwendige cookies|ablehnen/i,
  });

  if (
    await rejectButton
      .isVisible({
        timeout: LOCATOR_PROBE_TIMEOUT_MS,
      })
      .catch(() => false)
  ) {
    await rejectButton.click();
    return;
  }

  const settingsOrRejectLink = page.getByRole('link', {
    name: /einstellungen oder ablehnen/i,
  });

  if (
    await settingsOrRejectLink
      .isVisible({
        timeout: LOCATOR_PROBE_TIMEOUT_MS,
      })
      .catch(() => false)
  ) {
    await settingsOrRejectLink.click();

    const necessaryOnlyButton = page.getByRole('button', {
      name: /alle ablehnen|nur notwendige|auswahl speichern/i,
    });

    if (
      await necessaryOnlyButton
        .isVisible({
          timeout: LOCATOR_PROBE_TIMEOUT_MS,
        })
        .catch(() => false)
    ) {
      await necessaryOnlyButton.click();
    }
  }
}

async function openSearchInterfaceIfRequired(page: Page): Promise<void> {
  const currentlyVisibleSearchInputs = page.locator(
    'input[type="search"]:visible',
  );

  if ((await currentlyVisibleSearchInputs.count()) === 1) {
    return;
  }

  const searchTrigger = await findSingleVisibleLocator(
    [
      {
        description: 'search button',
        create: (): Locator =>
          page.getByRole('button', {
            name: /suche|suchen|search/i,
          }),
      },
      {
        description: 'search link',
        create: (): Locator =>
          page.getByRole('link', {
            name: /suche|suchen|search/i,
          }),
      },
      {
        description: 'search control with an accessible label',
        create: (): Locator =>
          page.locator(
            [
              '[aria-label*="Suche" i]',
              '[aria-label*="Suchen" i]',
              '[aria-label*="Search" i]',
            ].join(', '),
          ),
      },
      {
        description: 'search control with a title',
        create: (): Locator => page.getByTitle(/suche|suchen|search/i),
      },
    ],
    'search trigger',
  ).catch(() => null);

  if (searchTrigger) {
    await searchTrigger.click();
  }
}

async function findSearchInput(page: Page): Promise<Locator> {
  await openSearchInterfaceIfRequired(page);

  return findSingleVisibleLocator(
    [
      {
        description: 'search textbox with accessible name',
        create: (): Locator =>
          page.getByRole('textbox', {
            name: /suche|suchen|suchbegriff|marken|search/i,
          }),
      },
      {
        description: 'search input with placeholder',
        create: (): Locator =>
          page.getByPlaceholder(/suche|suchen|suchbegriff|marken|search/i),
      },
      {
        description: 'input with type search',
        create: (): Locator => page.locator('input[type="search"]'),
      },
      {
        description: 'search input with a conventional name',
        create: (): Locator =>
          page.locator(
            [
              'input[name="qs"]',
              'input[name="q"]',
              'input[name="search"]',
              'input[name="suchbegriff"]',
              'input[name="suchausdruck"]',
            ].join(', '),
          ),
      },
    ],
    'search input',
  );
}

async function submitSearch(
  page: Page,
  searchInput: Locator,
  searchTerm: string,
): Promise<void> {
  await expect(searchInput).toBeVisible();
  await expect(searchInput).toBeEditable();

  await searchInput.fill(searchTerm);

  const searchButton = page.getByRole('button', {
    name: /suche|suchen|search/i,
  });

  if (
    await searchButton
      .isVisible({
        timeout: LOCATOR_PROBE_TIMEOUT_MS,
      })
      .catch(() => false)
  ) {
    await searchButton.click();
  } else {
    await searchInput.press('Enter');
  }

  await expect(page.getByRole('main')).toBeVisible();
  await assertAuthorizedApplicationLoaded(page);
}

async function openConfiguredProduct(
  page: Page,
  productName: string,
): Promise<void> {
  const productLink = await findSingleVisibleLocator(
    [
      {
        description: `product link named "${productName}"`,
        create: (): Locator =>
          page.getByRole('link', {
            name: exactTextPattern(productName),
          }),
      },
      {
        description: `product link containing "${productName}"`,
        create: (): Locator =>
          page.getByRole('link').filter({
            hasText: new RegExp(escapeRegExp(productName), 'i'),
          }),
      },
    ],
    'configured product link',
  );

  await expect(productLink).toBeVisible();
  await productLink.click();

  await expect(page.getByRole('main')).toBeVisible();
  await assertAuthorizedApplicationLoaded(page);
}

async function addCurrentProductToCart(page: Page): Promise<void> {
  const addToCartControl = await findSingleVisibleLocator(
    [
      {
        description: 'add-to-cart button',
        create: (): Locator =>
          page.getByRole('button', {
            name: /\bin den warenkorb\b/i,
          }),
      },
      {
        description: 'add-to-cart link',
        create: (): Locator =>
          page.getByRole('link', {
            name: /\bin den warenkorb\b/i,
          }),
      },
      {
        description: 'submit button containing In den Warenkorb',
        create: (): Locator =>
          page.locator('button[type="submit"]').filter({
            hasText: /\bin den warenkorb\b/i,
          }),
      },
    ],
    'add-to-cart control',
  );

  await expect(addToCartControl).toBeVisible();
  await expect(addToCartControl).toBeEnabled();

  await addToCartControl.click();
}

async function openCart(page: Page): Promise<void> {
  const cartNavigation = await findSingleVisibleLocator(
    [
      {
        description: 'Zum Warenkorb button',
        create: (): Locator =>
          page.getByRole('button', {
            name: /\bzum warenkorb\b/i,
          }),
      },
      {
        description: 'Zum Warenkorb link',
        create: (): Locator =>
          page.getByRole('link', {
            name: /\bzum warenkorb\b/i,
          }),
      },
      {
        description: 'Warenkorb anzeigen link',
        create: (): Locator =>
          page.getByRole('link', {
            name: /\bwarenkorb anzeigen\b/i,
          }),
      },
    ],
    'cart-navigation control',
  );

  await expect(cartNavigation).toBeVisible();
  await cartNavigation.click();

  await expect(page.getByRole('main')).toBeVisible();
  await assertAuthorizedApplicationLoaded(page);
}

async function openCheckout(page: Page): Promise<void> {
  const checkoutNavigation = await findSingleVisibleLocator(
    [
      {
        description: 'Zur Kasse link',
        create: (): Locator =>
          page.getByRole('link', {
            name: /\bzur kasse\b|^checkout$/i,
          }),
      },
      {
        description: 'Zur Kasse button',
        create: (): Locator =>
          page.getByRole('button', {
            name: /\bzur kasse\b|^checkout$/i,
          }),
      },
    ],
    'checkout-navigation control',
  );

  await expect(checkoutNavigation).toBeVisible();
  await checkoutNavigation.click();
}

async function assertCheckoutEntryLoaded(page: Page): Promise<void> {
  await assertAuthorizedApplicationLoaded(page);
  await expect(page.getByRole('main')).toBeVisible();

  const checkoutIdentity = await findSingleVisibleLocator(
    [
      {
        description: 'customer-data section',
        create: (): Locator => page.getByText(/kundendaten/i),
      },
      {
        description: 'existing-customer login section',
        create: (): Locator =>
          page.getByText(/ich bin bereits kunde|anmelden/i),
      },
      {
        description: 'guest-checkout section',
        create: (): Locator =>
          page.getByText(
            /sie sind noch kein kunde|ohne registrierung bestellen/i,
          ),
      },
    ],
    'checkout-page identity',
  );

  await expect(checkoutIdentity).toBeVisible();

  const checkoutAction = await findSingleVisibleLocator(
    [
      {
        description: 'Anmelden button',
        create: (): Locator =>
          page.getByRole('button', {
            name: /^anmelden$/i,
          }),
      },
      {
        description: 'Kundendaten abschicken button',
        create: (): Locator =>
          page.getByRole('button', {
            name: /kundendaten abschicken/i,
          }),
      },
      {
        description: 'checkout continuation button',
        create: (): Locator =>
          page.getByRole('button', {
            name: /^weiter$/i,
          }),
      },
    ],
    'checkout action',
  );

  await expect(checkoutAction).toBeVisible();
}

test.describe('Desktop Navigation Flow @staging @stateful @requires-authorization', () => {
  test.describe.configure({
    mode: 'serial',
  });

  test.beforeEach(async ({ baseURL }): Promise<void> => {
    requireAuthorizedStaging(baseURL);
  });

  test('navigates from search to checkout entry on approved staging', async ({
    page,
  }): Promise<void> => {
    const testData = loadNavigationTestData();

    await test.step('Open the authorized staging homepage', async (): Promise<void> => {
      const response = await page.goto('/', {
        waitUntil: 'domcontentloaded',
      });

      await assertSuccessfulDocumentResponse(
        response,
        'Staging homepage navigation',
      );

      await assertAuthorizedApplicationLoaded(page);
      await dismissCookieBannerIfPresent(page);
    });

    await test.step('Search for the configured staging product', async (): Promise<void> => {
      const searchInput = await findSearchInput(page);

      await submitSearch(page, searchInput, testData.searchTerm);
    });

    await test.step('Open the configured product', async (): Promise<void> => {
      await openConfiguredProduct(page, testData.productName);
    });

    await test.step('Add the product to the cart', async (): Promise<void> => {
      await addCurrentProductToCart(page);
    });

    await test.step('Open the cart', async (): Promise<void> => {
      await openCart(page);
    });

    await test.step('Navigate to checkout entry', async (): Promise<void> => {
      await openCheckout(page);
      await assertCheckoutEntryLoaded(page);
    });

    /*
     * Intentional stopping point:
     *
     * Do not enter or submit customer data.
     * Do not select shipping or payment methods.
     * Do not confirm or place an order.
     */
  });
});
