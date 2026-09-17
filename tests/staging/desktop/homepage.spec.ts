import type { Locator, Page, Response } from '@playwright/test';
import { expect, test } from '../../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

const HOMEPAGE_TIMEOUT_MS = 20_000;
const SEARCH_TERM = 'parfum';
const PRODUCT_SAMPLE_SIZE = 4;

const EXPECTED_CATEGORY_DESTINATIONS = [
  '/parfuem',
  '/gesicht',
  '/koerper',
  '/make-up',
  '/haare',
  '/natur',
  '/maenner',
  '/drogerie',
  '/geschenke',
  '/sale',
] as const;

function assertSuccessfulResponse(
  response: Response | null,
): asserts response is Response {
  if (!response) {
    throw new Error('Staging homepage returned no document response.');
  }

  expect(
    response.status(),
    `Staging homepage returned HTTP ${response.status()}.`,
  ).toBeLessThan(400);
}

async function assertAuthorizedApplicationLoaded(page: Page): Promise<void> {
  await expect(
    page.getByRole('heading', { name: /unauthorized/i }),
  ).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(
    /could not verify that you are authorized/i,
  );
}

async function visibleLocators(locator: Locator): Promise<Locator[]> {
  const matches: Locator[] = [];
  const count = await locator.count();

  for (let index = 0; index < count; index += 1) {
    const candidate = locator.nth(index);

    if (await candidate.isVisible()) {
      matches.push(candidate);
    }
  }

  return matches;
}

async function assertSameOriginDestination(
  link: Locator,
  baseURL: string,
): Promise<void> {
  const href = await link.getAttribute('href');

  expect(href, 'A visible promotional link must have an href.').toBeTruthy();

  const destination = new URL(href ?? '', baseURL);

  expect(destination.protocol).toBe('https:');
  expect(destination.origin).toBe(new URL(baseURL).origin);
}

test.describe('Desktop homepage @staging @requires-authorization', () => {
  test.beforeEach(async ({ baseURL, page, homePage }): Promise<void> => {
    requireAuthorizedStaging(baseURL);

    const response = await homePage.gotoHome();

    assertSuccessfulResponse(response);
    await homePage.cookieBanner.dismissIfPresent();
    await homePage.dismissBlockingOverlays();
    await assertAuthorizedApplicationLoaded(page);
  });

  test('loads the desktop homepage with its primary landmarks', async ({
    page,
    homePage,
  }): Promise<void> => {
    await test.step('Verify page identity', async (): Promise<void> => {
      await expect(page).toHaveTitle(/Beautywelt|Haarpflege/i);
      await expect(homePage.header.root).toBeVisible({
        timeout: HOMEPAGE_TIMEOUT_MS,
      });
      await expect(homePage.mainContent).toBeVisible({
        timeout: HOMEPAGE_TIMEOUT_MS,
      });
      await expect(homePage.heading).toBeVisible({
        timeout: HOMEPAGE_TIMEOUT_MS,
      });
      await expect(homePage.footer.root).toBeVisible({
        timeout: HOMEPAGE_TIMEOUT_MS,
      });
    });

    await test.step('Verify desktop header entry points', async (): Promise<void> => {
      await expect(homePage.header.homeLink).toHaveCount(1);
      await expect(homePage.header.homeLink).toBeVisible();
      await expect(homePage.header.logo).toBeVisible();
      await expect(homePage.header.accountLink).toBeVisible();
      await expect(homePage.header.cartLink).toBeVisible();
    });
  });

  test('exposes every primary category destination in the desktop navigation', async ({
    homePage,
  }): Promise<void> => {
    await expect(homePage.header.primaryCategories).toHaveCount(
      EXPECTED_CATEGORY_DESTINATIONS.length,
    );

    const categoryLinks = await visibleLocators(
      homePage.header.primaryCategories,
    );

    expect(categoryLinks).toHaveLength(EXPECTED_CATEGORY_DESTINATIONS.length);

    const destinations = await Promise.all(
      categoryLinks.map((link) => link.getAttribute('href')),
    );

    expect(destinations).toEqual(EXPECTED_CATEGORY_DESTINATIONS);

    for (const categoryLink of categoryLinks) {
      await expect(categoryLink).toBeVisible();
    }
  });

  test('submits a homepage search and renders the search results page', async ({
    page,
    homePage,
  }): Promise<void> => {
    await test.step('Verify the search control is ready', async (): Promise<void> => {
      await homePage.search.expectReady();
    });

    await test.step('Search for a catalog term', async (): Promise<void> => {
      await homePage.search.searchFor(SEARCH_TERM);

      await expect(page).toHaveURL(/\/suche(?:[/?#]|$)/i, {
        timeout: HOMEPAGE_TIMEOUT_MS,
      });
      await expect(page.getByRole('main')).toBeVisible({
        timeout: HOMEPAGE_TIMEOUT_MS,
      });
      await expect(homePage.search.input).toHaveValue(SEARCH_TERM);
      await assertAuthorizedApplicationLoaded(page);
    });
  });

  test('renders linked hero and promotional imagery with safe destinations', async ({
    baseURL,
    homePage,
  }): Promise<void> => {
    if (!baseURL) {
      throw new Error('baseURL is required for promotional-link validation.');
    }

    const imageLinks = homePage.mainContent
      .getByRole('link')
      .filter({ has: homePage.mainContent.getByRole('img') });
    const visibleImageLinks = await visibleLocators(imageLinks);
    const promotionalLinks: Locator[] = [];

    for (const link of visibleImageLinks) {
      const href = await link.getAttribute('href');

      if (href && !/\/a\/\d+(?:[/?#]|$)/i.test(href)) {
        promotionalLinks.push(link);
      }
    }

    expect(
      promotionalLinks.length,
      'Expected at least one visible linked hero or promotional banner.',
    ).toBeGreaterThan(0);

    for (const link of promotionalLinks.slice(0, PRODUCT_SAMPLE_SIZE)) {
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
      await assertSameOriginDestination(link, baseURL);
      await expect(link.getByRole('img')).toBeVisible();
    }
  });

  test('renders complete product carousel cards', async ({
    homePage,
  }): Promise<void> => {
    const productCards = await homePage.getVisibleProductCards();

    expect(
      productCards.length,
      'Expected at least one visible product card on the homepage.',
    ).toBeGreaterThan(0);

    for (const [index, productCard] of productCards
      .slice(0, PRODUCT_SAMPLE_SIZE)
      .entries()) {
      await test.step(`Verify product card ${index + 1}`, async (): Promise<void> => {
        await productCard.expectCompleteInformation();
      });
    }
  });

  test('renders brand promotions and the newsletter signup section', async ({
    baseURL,
    homePage,
  }): Promise<void> => {
    if (!baseURL) {
      throw new Error('baseURL is required for brand-link validation.');
    }

    const visibleBrandLinks = await visibleLocators(homePage.brandLinks);

    expect(
      visibleBrandLinks.length,
      'Expected at least one visible brand promotion.',
    ).toBeGreaterThan(0);

    for (const brandLink of visibleBrandLinks.slice(0, PRODUCT_SAMPLE_SIZE)) {
      await assertSameOriginDestination(brandLink, baseURL);
      await expect(brandLink).toHaveAttribute('aria-label', /\S+/);
    }

    await expect(homePage.newsletterForm).toHaveCount(1);
    await expect(homePage.newsletterForm).toBeVisible();
    await expect(homePage.newsletterForm.getByRole('textbox')).toHaveCount(1);
    await expect(homePage.newsletterForm.getByRole('textbox')).toBeEditable();
    await expect(homePage.newsletterForm.getByRole('button')).toHaveCount(1);
    await expect(homePage.newsletterForm.getByRole('button')).toBeEnabled();
  });

  test('renders all legal and customer-service footer links', async ({
    homePage,
  }): Promise<void> => {
    const footerLinks = [
      homePage.footer.privacyLink,
      homePage.footer.imprintLink,
      homePage.footer.termsLink,
      homePage.footer.withdrawalLink,
      homePage.footer.shippingLink,
      homePage.footer.paymentLink,
      homePage.footer.accessibilityLink,
    ];

    for (const footerLink of footerLinks) {
      await expect(footerLink).toHaveCount(1);
      await expect(footerLink).toBeVisible();
    }
  });
});
