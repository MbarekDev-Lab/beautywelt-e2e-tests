import { test, expect } from '../../fixtures/pom-fixtures';

test.describe('Category Page @production-readonly', () => {
  test.beforeEach(async ({ homePage, page }) => {
    await homePage.gotoHome();
    await homePage.cookieBanner.dismissIfPresent();

    // Safely navigate to a category page. Instead of clicking a brittle menu, we directly load a known category or search and click.
    // For production read-only, hitting a generic category path is safer than mutating.
    // Since we don't know the exact category paths dynamically, we can use search to trigger a category-like product listing.
    await homePage.searchInput.fill('parfum');
    await homePage.searchInput.press('Enter');
  });

  test('should display product grid in search/category results', async ({ searchResultsPage }) => {
    await searchResultsPage.waitForMainContent();
    
    // Assert that the page title reflects the search/category intent
    await expect(searchResultsPage.page).toHaveTitle(/parfum|suche/i);
    
    // Assert that product cards are visible and populated
    await expect(searchResultsPage.productCards).not.toHaveCount(0);
    
    // Check that at least the first link is valid and visible
    await expect(searchResultsPage.firstProductLink).toBeVisible();
  });
});
