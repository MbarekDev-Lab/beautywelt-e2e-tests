import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CategoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get title(): Locator {
    return this.page.locator('h1').first();
  }

  get productList(): Locator {
    return this.page.locator('article, .product-card').filter({ has: this.page.locator('a') });
  }
}
