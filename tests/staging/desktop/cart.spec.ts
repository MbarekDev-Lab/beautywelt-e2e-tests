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

    if (isProductionHost(baseURL)) {
      test.skip(true, 'Cart mutations are prohibited against production.');
    }

  });

  test('adds item and updates quantity on staging', async ({ page, homePage, searchResultsPage, productDetailPage, cartPage, }) => {
    // Navigate and consent
    await homePage.gotoHome();
    await homePage.cookieBanner.dismissIfPresent();

    // Search and select
    await homePage.searchInput.fill('conditioner');
    await homePage.searchInput.press('Enter');

    await searchResultsPage.waitForMainContent();
    await searchResultsPage.firstProductLink.click();

    // Add to cart
    await productDetailPage.waitForMainContent();
    await productDetailPage.addToCartButton.click();

    // Go to cart
    await page.goto('/warenkorb.php');
    await cartPage.waitForMainContent();

    // Verify cart is populated
    await expect(cartPage.cartItem).not.toHaveCount(0);

    // Update quantity logic would go here, relying on staging backend specific UI
    await page.getByRole('textbox', { name: /anzahl|quantity/i }).fill('2');
    await page.getByRole('button', { name: /aktualisieren|update/i }).click();


  });

});
