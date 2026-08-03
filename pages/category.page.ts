import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CategoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get title(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  get productList(): Locator {
    return this.page
      .locator('article, .product-card')
      .filter({ has: this.page.locator('a') });
  }
}
