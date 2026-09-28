import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SearchResultsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get productCards(): Locator {
    return this.page
      .locator('article, .product-card, [data-testid="product-card"], .article-wrapper, .product-wrapper')
      .filter({ has: this.page.locator('a') });
  }

  async clickFirstVisibleProductLink(options?: { force?: boolean }): Promise<void> {
    const fallbackCards = this.page.locator('li:has(a[href*="/a/"][title]), article, .product-card, [data-testid="product-card"], .article-wrapper, .product-wrapper');
    await fallbackCards.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    const count = await fallbackCards.count();
    for (let i = 0; i < count; i++) {
      const card = fallbackCards.nth(i);
      if (await card.isVisible().catch(() => false)) {
        const links = card.locator('a');
        const linksCount = await links.count();
        for (let j = 0; j < linksCount; j++) {
           if (await links.nth(j).isVisible().catch(() => false)) {
             await links.nth(j).click(options);
             return;
           }
        }
      }
    }
    throw new Error('Could not find any visible product link.');
  }
}
