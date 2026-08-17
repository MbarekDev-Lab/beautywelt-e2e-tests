import { test, expect } from '../../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

test.beforeEach(async ({ baseURL }): Promise<void> => {
  requireAuthorizedStaging(baseURL);
});

test.describe('Cart @staging @stateful @requires-authorization', () => {
  test.beforeEach(async ({ baseURL }) => {
    if (!baseURL) {
      throw new Error('BASE_URL is required.');
    }

    /*if (isProductionHost(baseURL)) {
      test.skip(true, 'Cart mutations are prohibited against production.');
    }*/
  });

  test('adds item and updates quantity on staging', async ({
    page,
    homePage,
    searchResultsPage,
    productDetailPage,
    cartPage,
  }) => {
    // Navigate and consent
    await homePage.gotoHome();
    await homePage.cookieBanner.dismissIfPresent();
    await homePage.dismissBlockingOverlays();

    // Search and select
    const searchTrigger = page.getByRole('button', { name: /suche|suchen|search/i }).first();
    if (await searchTrigger.isVisible().catch(() => false)) {
      await searchTrigger.click({ force: true });
    }
    await homePage.searchInput.fill('conditioner');
    const searchButton = page.getByRole('button', { name: /suchen|submit|los/i }).first();
    if (await searchButton.isVisible().catch(() => false)) {
      await searchButton.click({ force: true });
    } else {
      await homePage.searchInput.press('Enter');
    }

    await searchResultsPage.waitForMainContent();
    await searchResultsPage.firstProductLink.click({ force: true });

    // Add to cart
    await productDetailPage.waitForMainContent();
    await productDetailPage.addToCartButton.click();

    // Go to cart
    await page.goto('/warenkorb.php');
    await cartPage.waitForMainContent();

    // Verify cart is populated
    await expect(cartPage.cartItem).not.toHaveCount(0);

    // Update quantity: wait for controls to appear, then update and confirm
    const quantity = page.locator('input[type="number"]').first();
    await expect(quantity).toBeVisible({ timeout: 5000 });
    await quantity.fill('2');

    // Prefer semantic role-based button lookup, fallback to button-like elements with matching text
    const updateBtn = page
      .locator(
        'button, input[type="submit"], input[type="button"], [role="button"]',
      )
      .filter({ hasText: /aktualisieren|update/i })
      .first();
    if ((await updateBtn.count()) > 0) {
      await expect(updateBtn).toBeVisible({ timeout: 5000 });
      await Promise.all([
        updateBtn.click(),
        Promise.race([
          page
            .waitForResponse(
              (resp) => /warenkorb/i.test(resp.url()) && resp.ok(),
              { timeout: 15000 },
            )
            .catch(() => null),
          page
            .waitForLoadState('networkidle', { timeout: 15000 })
            .catch(() => null),
        ]),
      ]);
    } else {
      // Some carts apply quantity changes on blur/enter — try both
      await quantity.press('Enter');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }

    await cartPage.waitForMainContent();
    // Accept values that start with 2 (e.g. "2", "2.00")
    await expect(quantity).toHaveValue(/^\s*2/, { timeout: 10000 });
  });
});
