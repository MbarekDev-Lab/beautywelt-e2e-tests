import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get cartItem(): Locator {
    return this.page.locator('tbody tr, .cart-item, .basket-item').first();
  }

  get checkoutButton(): Locator {
    return this.page.getByRole('link', { name: /zur kasse|kasse/i }).first();
  }
}
