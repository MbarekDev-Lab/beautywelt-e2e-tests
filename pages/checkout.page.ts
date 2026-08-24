import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';


export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get guestCheckoutOption(): Locator {
    return this.page.getByRole('radio', { name: /gast|guest/i });
  }

  get reviewSummary(): Locator {
    return this.page.locator('text=/bestellungsübersicht|übersicht|review/i');
  }
}
