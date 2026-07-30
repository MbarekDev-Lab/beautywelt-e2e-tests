import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get title(): Locator {
    return this.page.locator('h1').first();
  }

  get price(): Locator {
    return this.page.locator('text=/€|EUR/i').first();
  }

  get addToCartButton(): Locator {
    return this.page.getByRole('button', { name: /in den warenkorb|add to cart|zum warenkorb/i }).first();
  }
}
