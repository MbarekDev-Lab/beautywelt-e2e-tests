import type { Response } from '@playwright/test';
import { test, expect } from '../../fixtures/pom-fixtures';

function assertSuccessfulProductionResponse(
  response: Response | null,
): asserts response is Response {
  if (!response) {
    throw new Error('Beautywelt homepage returned no document response.');
  }

  const status = response.status();

  expect(
    status,
    `Expected Beautywelt homepage status below 400, received ${status}.`,
  ).toBeLessThan(400);
}

test.describe('Beautywelt Homepage @production-readonly @smoke', () => {
  test('loads with the expected identity and landmarks', async ({
    page,
    homePage,
  }): Promise<void> => {
    await test.step('Open the public Beautywelt homepage', async (): Promise<void> => {
      const response = await homePage.gotoHome();

      assertSuccessfulProductionResponse(response);
      await homePage.cookieBanner.dismissIfPresent();
    });

    await test.step('Verify public homepage identity', async (): Promise<void> => {
      await expect(page).toHaveTitle(/online parf.*merie.*beautywelt/i);

      await expect(homePage.header.root).toBeVisible();
      await expect(homePage.header.logo).toBeVisible();
      await expect(homePage.mainContent).toBeVisible();
      await expect(homePage.heading).toBeVisible();
      await expect(homePage.footer.root).toBeVisible();
    });
  });

  test('displays the public search control without submitting it', async ({
    homePage,
  }): Promise<void> => {
    const response = await homePage.gotoHome();

    assertSuccessfulProductionResponse(response);
    await homePage.cookieBanner.dismissIfPresent();

    await homePage.search.expectReady();
  });

  test('displays the expected primary category destinations', async ({
    homePage,
  }): Promise<void> => {
    const response = await homePage.gotoHome();

    assertSuccessfulProductionResponse(response);
    await homePage.cookieBanner.dismissIfPresent();

    const expectedCategoryDestinations = [
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
    ];

    for (const destination of expectedCategoryDestinations) {
      await expect(
        homePage.header.root.locator(`a[href="${destination}"]`),
      ).toHaveCount(1);
    }
  });

  test('displays public homepage product cards with valid identity', async ({ homePage, }): Promise<void> => {
    const response = await homePage.gotoHome();

    assertSuccessfulProductionResponse(response);
    await homePage.cookieBanner.dismissIfPresent();

    const productCards = await homePage.getVisibleProductCards();

    expect(
      productCards.length,
      'Expected at least one visible homepage product card.',
    ).toBeGreaterThan(0);

    /*
     * Limit the production smoke check to three visible cards.
     * This prevents broad catalog enumeration.
     */
    for (const [index, productCard] of productCards.slice(0, 3).entries()) {
      await test.step(`Verify public product card ${index + 1}`, async (): Promise<void> => {
        await productCard.expectCompleteInformation();
      });
    }
  });

  test('displays the cart control without opening or mutating the cart', async ({ homePage, }): Promise<void> => {
    const response = await homePage.gotoHome();

    assertSuccessfulProductionResponse(response);
    await homePage.cookieBanner.dismissIfPresent();

    await expect(homePage.header.cartLink).toHaveCount(1);
    await expect(homePage.header.cartLink).toBeVisible();

    await expect(homePage.header.cartLink).toHaveAttribute(
      'href',
      '/warenkorb.php',
    );

    /*
     * Intentional stopping point:
     *
     * Do not click the production cart link.
     * Do not add products to the production cart.
     */
  });

  test('displays the required legal footer links', async ({
    homePage,
  }): Promise<void> => {
    const response = await homePage.gotoHome();

    assertSuccessfulProductionResponse(response);
    await homePage.cookieBanner.dismissIfPresent();

    await expect(homePage.footer.privacyLink).toBeVisible();
    await expect(homePage.footer.imprintLink).toBeVisible();
    await expect(homePage.footer.termsLink).toBeVisible();
    await expect(homePage.footer.withdrawalLink).toBeVisible();
    await expect(homePage.footer.accessibilityLink).toBeVisible();
  });
});
