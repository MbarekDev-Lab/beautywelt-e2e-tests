import type { Locator, Page, Response } from '@playwright/test';
import { expect, test } from '../../../fixtures/pom-fixtures';

const UI_TIMEOUT = 20_000;
const OVERLAY_TIMEOUT = 10_000;

const TEST_DATA = {
  searchTerm: 'parfum',
  preferredProduct: /ROJA Isola Blu/i,
  customer: {
    firstName: 'Mbarek',
    lastName: 'Benraiss',
    phone: '+49 30 12345678',
    street: 'Teststrasse 1',
    postalCode: '12345',
    city: 'Berlin',
  },
} as const;

const TEXT = {
  search: /Suchen in allen Marken|Suchen|Search/i,
  addToCart: /^(In den Warenkorb|In den Einkaufswagen|Add to cart)$/i,
  openCart:
    /^(Zum Warenkorb|Zum Einkaufswagen|Warenkorb|Einkaufswagen|Go to cart)$/i,
  cartHeading: /Warenkorb|Einkaufswagen|Cart/i,
  checkout: /^(Zur Kasse|Weiter zur Kasse|Kasse|Checkout)$/i,
  closeOverlay:
    /Schließen|Close|Ablehnen|Akzeptieren|Alle akzeptieren|Verstanden|Nein danke/i,
} as const;

function assertSuccessfulResponse(
  response: Response | null,
): asserts response is Response {
  if (!response) {
    throw new Error('The homepage returned no document response.');
  }

  if (response.status() >= 400) {
    throw new Error(
      `Expected a response status below 400, but received ` +
        `${response.status()} for ${response.url()}.`,
    );
  }
}

async function isVisible(locator: Locator): Promise<boolean> {
  return locator.isVisible().catch(() => false);
}

async function findFirstExistingLocator(
  candidates: Locator[],
  description: string,
): Promise<Locator> {
  for (const candidate of candidates) {
    if ((await candidate.count()) > 0) {
      return candidate.first();
    }
  }

  throw new Error(
    `Could not find ${description}. Current URL: ${
      candidates[0]?.page().url() ?? 'unknown'
    }`,
  );
}

async function getSearchInput(page: Page): Promise<Locator> {
  const header = page.locator('header').first();

  return findFirstExistingLocator(
    [
      header.getByRole('searchbox', { name: TEXT.search }),
      page.getByRole('searchbox', { name: TEXT.search }),
      header.getByRole('textbox', { name: TEXT.search }),
      page.getByRole('textbox', { name: TEXT.search }),
      page.locator(
        [
          'input[type="search"][placeholder*="Suchen" i]',
          'input[type="search"][placeholder*="Search" i]',
          'input[type="search"][aria-label*="Suchen" i]',
          'input[type="search"][aria-label*="Search" i]',
          'input[type="text"][placeholder*="Suchen" i]',
          'input[type="text"][placeholder*="Search" i]',
          'input[type="text"][aria-label*="Suchen" i]',
          'input[type="text"][aria-label*="Search" i]',
        ].join(','),
      ),
    ],
    'the product search input',
  );
}

async function getProductLink(page: Page): Promise<Locator> {
  return findFirstExistingLocator(
    [
      page.getByRole('link', {
        name: TEST_DATA.preferredProduct,
      }),
      page.locator('a[href]').filter({
        hasText: TEST_DATA.preferredProduct,
      }),
      page
        .locator(
          [
            '[data-testid*="product"] a[href]',
            '[class*="product"] a[href]',
            '.product-item a[href]',
            '.product-box a[href]',
          ].join(','),
        )
        .filter({
          hasText: /parfum|duft|roja|isola|blu/i,
        }),
    ],
    `a product link after searching for "${TEST_DATA.searchTerm}"`,
  );
}

async function dismissBlockingOverlays(page: Page): Promise<void> {
  const overlays = page.locator(
    ['[role="dialog"]', '[aria-modal="true"]', '.bwa10.bwin'].join(','),
  );

  const overlayCount = await overlays.count();

  for (let index = 0; index < overlayCount; index++) {
    const overlay = overlays.nth(index);

    if (!(await isVisible(overlay))) {
      continue;
    }

    const closeButton = overlay
      .getByRole('button', { name: TEXT.closeOverlay })
      .first();

    const closeLink = overlay
      .getByRole('link', { name: TEXT.closeOverlay })
      .first();

    if (await isVisible(closeButton)) {
      await closeButton.click();
    } else if (await isVisible(closeLink)) {
      await closeLink.click();
    } else {
      const overlayText = await overlay
        .innerText()
        .catch(() => 'Unable to read overlay content.');

      console.warn(
        `A visible overlay was found without a recognizable ` +
          `close control. Content: ${overlayText.slice(0, 300)}`,
      );

      continue;
    }

    await expect(overlay).toBeHidden({
      timeout: OVERLAY_TIMEOUT,
    });
  }
}

async function clickAddToCart(page: Page): Promise<void> {
  const addToCartButton = await findFirstExistingLocator(
    [
      page.getByRole('button', {
        name: TEXT.addToCart,
      }),
      page.locator('button[type="submit"]').filter({ hasText: TEXT.addToCart }),
      page
        .locator('button, [role="button"]')
        .filter({ hasText: TEXT.addToCart }),
    ],
    'the add-to-cart button',
  );

  await expect(addToCartButton).toBeVisible({
    timeout: UI_TIMEOUT,
  });
  await expect(addToCartButton).toBeEnabled({
    timeout: UI_TIMEOUT,
  });

  await addToCartButton.scrollIntoViewIfNeeded();

  try {
    await addToCartButton.click({
      timeout: OVERLAY_TIMEOUT,
    });
  } catch (error) {
    /*
     * A newsletter, consent, or promotional overlay may appear after
     * the initial visibility assertion and intercept the click.
     */
    await dismissBlockingOverlays(page);

    await expect(addToCartButton).toBeVisible({
      timeout: UI_TIMEOUT,
    });
    await expect(addToCartButton).toBeEnabled({
      timeout: UI_TIMEOUT,
    });

    await addToCartButton.scrollIntoViewIfNeeded();
    await addToCartButton.click({ timeout: UI_TIMEOUT });
    console.log(error);
  }
}

async function openCart(page: Page): Promise<void> {
  const openCartControl = await findFirstExistingLocator(
    [
      page.getByRole('link', {
        name: TEXT.openCart,
      }),
      page.getByRole('button', {
        name: TEXT.openCart,
      }),
      page
        .locator('a, button, [role="button"]')
        .filter({ hasText: TEXT.openCart }),
    ],
    'the open-cart control',
  );

  await expect(openCartControl).toBeVisible({
    timeout: UI_TIMEOUT,
  });

  await openCartControl.click();

  await expect(
    page.getByRole('heading', {
      name: TEXT.cartHeading,
    }),
  ).toBeVisible({
    timeout: UI_TIMEOUT,
  });
}

async function proceedToCheckout(page: Page): Promise<void> {
  const checkoutButton = await findFirstExistingLocator(
    [
      page.getByRole('link', {
        name: TEXT.checkout,
      }),
      page.getByRole('button', {
        name: TEXT.checkout,
      }),
      page
        .locator('a, button, [role="button"]')
        .filter({ hasText: TEXT.checkout }),
    ],
    'the checkout button',
  );

  await expect(checkoutButton).toBeVisible({
    timeout: UI_TIMEOUT,
  });
  await expect(checkoutButton).toBeEnabled({
    timeout: UI_TIMEOUT,
  });

  await checkoutButton.click();
}

function getFirstNameInput(page: Page): Locator {
  return page
    .locator(
      [
        'input[name="vorname" i]',
        'input[name="firstname" i]',
        'input[name="first_name" i]',
        'input[id*="vorname" i]',
        'input[id*="firstname" i]',
        'input[autocomplete="given-name"]',
        'input[placeholder*="Vorname" i]',
        'input[placeholder*="First name" i]',
        'input[aria-label*="Vorname" i]',
        'input[aria-label*="First name" i]',
      ].join(','),
    )
    .first();
}

function getLastNameInput(page: Page): Locator {
  return page
    .locator(
      [
        'input[name="nachname" i]',
        'input[name="lastname" i]',
        'input[name="last_name" i]',
        'input[id*="nachname" i]',
        'input[id*="lastname" i]',
        'input[autocomplete="family-name"]',
        'input[placeholder*="Nachname" i]',
        'input[placeholder*="Last name" i]',
        'input[aria-label*="Nachname" i]',
        'input[aria-label*="Last name" i]',
      ].join(','),
    )
    .first();
}

function getPhoneInput(page: Page): Locator {
  return page
    .locator(
      [
        'input[name="tel" i]',
        'input[name="telefon" i]',
        'input[name="phone" i]',
        'input[id*="telefon" i]',
        'input[id*="phone" i]',
        'input[autocomplete="tel"]',
        'input[type="tel"]',
        'input[placeholder*="Telefon" i]',
        'input[placeholder*="Phone" i]',
        'input[aria-label*="Telefon" i]',
        'input[aria-label*="Phone" i]',
      ].join(','),
    )
    .first();
}

function getStreetInput(page: Page): Locator {
  return page
    .locator(
      [
        'input[name="strasse" i]',
        'input[name="street" i]',
        'input[name="adresse" i]',
        'input[id*="strasse" i]',
        'input[id*="street" i]',
        'input[autocomplete="street-address"]',
        'input[placeholder*="Straße" i]',
        'input[placeholder*="Strasse" i]',
        'input[placeholder*="Street" i]',
        'input[aria-label*="Straße" i]',
        'input[aria-label*="Street" i]',
      ].join(','),
    )
    .first();
}

function getPostalCodeInput(page: Page): Locator {
  return page
    .locator(
      [
        'input[name="plz" i]',
        'input[name="postcode" i]',
        'input[name="postalCode" i]',
        'input[id*="plz" i]',
        'input[id*="postcode" i]',
        'input[autocomplete="postal-code"]',
        'input[placeholder*="PLZ" i]',
        'input[placeholder*="Postleitzahl" i]',
        'input[placeholder*="Postcode" i]',
        'input[aria-label*="PLZ" i]',
        'input[aria-label*="Postcode" i]',
      ].join(','),
    )
    .first();
}

function getCityInput(page: Page): Locator {
  return page
    .locator(
      [
        'input[name="ort" i]',
        'input[name="city" i]',
        'input[name="stadt" i]',
        'input[id*="ort" i]',
        'input[id*="city" i]',
        'input[autocomplete="address-level2"]',
        'input[placeholder*="Ort" i]',
        'input[placeholder*="Stadt" i]',
        'input[placeholder*="City" i]',
        'input[aria-label*="Ort" i]',
        'input[aria-label*="City" i]',
      ].join(','),
    )
    .first();
}

async function selectSalutationIfPresent(page: Page): Promise<void> {
  const salutationSelect = page
    .locator(
      [
        'select[name="anrede" i]',
        'select[name="salutation" i]',
        'select[id*="anrede" i]',
        'select[id*="salutation" i]',
        'select[aria-label*="anrede" i]',
        'select[aria-label*="salutation" i]',
        'select[autocomplete="honorific-prefix"]',
      ].join(','),
    )
    .first();

  if (!(await isVisible(salutationSelect))) {
    return;
  }

  const options = await salutationSelect.locator('option').allTextContents();

  const herrOption = options.find((option) => /^Herr$/i.test(option.trim()));

  if (herrOption) {
    await salutationSelect.selectOption({
      label: herrOption,
    });
  }
}

async function fillRequiredInput(
  locator: Locator,
  value: string,
  fieldName: string,
): Promise<void> {
  await expect(
    locator,
    `Expected the ${fieldName} input to be available on checkout.`,
  ).toBeVisible({ timeout: UI_TIMEOUT });

  await locator.fill(value);

  await expect(locator).toHaveValue(value);
}

async function fillOptionalInput(
  locator: Locator,
  value: string,
): Promise<void> {
  if (!(await isVisible(locator))) {
    return;
  }

  await locator.fill(value);
  await expect(locator).toHaveValue(value);
}

async function fillCustomerDetails(page: Page): Promise<void> {
  const firstNameInput = getFirstNameInput(page);
  const lastNameInput = getLastNameInput(page);
  const phoneInput = getPhoneInput(page);
  const streetInput = getStreetInput(page);
  const postalCodeInput = getPostalCodeInput(page);
  const cityInput = getCityInput(page);

  await selectSalutationIfPresent(page);

  await fillRequiredInput(
    firstNameInput,
    TEST_DATA.customer.firstName,
    'first-name',
  );

  await fillRequiredInput(
    lastNameInput,
    TEST_DATA.customer.lastName,
    'last-name',
  );
  await fillOptionalInput(phoneInput, TEST_DATA.customer.phone);
  await fillRequiredInput(streetInput, TEST_DATA.customer.street, 'street');

  await fillRequiredInput(
    postalCodeInput,
    TEST_DATA.customer.postalCode,
    'postal-code',
  );

  await fillRequiredInput(cityInput, TEST_DATA.customer.city, 'city');
}

test.describe('Haarpflege Beauty homepage on iPhone 13 @staging @smoke', () => {
  test.beforeEach(async ({ page, homePage }) => {
    await test.step('Open the authorized test homepage', async () => {
      const response = await homePage.gotoHome();

      assertSuccessfulResponse(response);

      await homePage.cookieBanner.dismissIfPresent();
      await dismissBlockingOverlays(page);
    });
  });

  test('loads with the expected identity and landmarks', async ({
    page,
    homePage,
  }) => {
    await test.step('Verify homepage identity', async () => {
      await expect(page).toHaveURL(/haarpflege-beauty\.de/i);

      await expect(page).toHaveTitle(/Haarpflege|Beauty/i);
    });

    await test.step('Verify primary page landmarks', async () => {
      await expect(homePage.header.root).toBeVisible({
        timeout: UI_TIMEOUT,
      });

      await expect(homePage.heading).toBeVisible({
        timeout: UI_TIMEOUT,
      });

      await expect(homePage.footer.root).toBeVisible({
        timeout: UI_TIMEOUT,
      });
    });
  });

  test('searches for a product and fills checkout details', async ({
    page,
    homePage,
  }) => {
    await test.step('Search for a product', async () => {
      const searchInput = await getSearchInput(page);

      await expect(searchInput).toBeVisible({
        timeout: UI_TIMEOUT,
      });

      await searchInput.fill(TEST_DATA.searchTerm);

      await searchInput.press('Enter');
    });

    await test.step('Open a product from the search results', async () => {
      const productLink = await getProductLink(page);

      await expect(productLink).toBeVisible({
        timeout: UI_TIMEOUT,
      });

      await productLink.scrollIntoViewIfNeeded();
      await productLink.click();

      await homePage.cookieBanner.dismissIfPresent();
      await dismissBlockingOverlays(page);
    });

    await test.step('Add the product to the cart', async () => {
      await clickAddToCart(page);
    });

    await test.step('Open the shopping cart', async () => {
      await openCart(page);
    });

    await test.step('Proceed to checkout', async () => {
      await proceedToCheckout(page);
    });

    await test.step('Fill the customer details', async () => {
      await fillCustomerDetails(page);
    });
  });
});
