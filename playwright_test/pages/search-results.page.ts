import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SearchResultsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get productCards(): Locator {
    return this.page.locator('article, .product-card, [data-testid="product-card"]').filter({ has: this.page.locator('a') }).first();
  }

  get firstProductLink(): Locator {
    return this.page.locator('a[href]').filter({ has: this.page.locator('img, h2, h3, h4') }).first();
  }
}
