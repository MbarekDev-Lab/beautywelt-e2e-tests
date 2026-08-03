import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SearchResultsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get productCards(): Locator {
    return this.page
      .locator('article, .product-card, [data-testid="product-card"]')
      .filter({ has: this.page.locator('a') });
  }

  get firstProductLink(): Locator {
    return this.productCards.nth(0).locator('a[href]').nth(0);
  }
}
