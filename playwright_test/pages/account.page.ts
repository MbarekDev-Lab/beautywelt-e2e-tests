import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get registerLink(): Locator {
    return this.page.getByRole('link', { name: /registrieren|konto erstellen|anmelden/i }).first();
  }

  get loginLink(): Locator {
    return this.page.getByRole('link', { name: /anmelden|mein konto/i }).first();
  }
}
