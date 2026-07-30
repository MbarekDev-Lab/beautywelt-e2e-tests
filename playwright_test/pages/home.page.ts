import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get header(): Locator {
    return this.page.locator('header').first();
  }

  get footer(): Locator {
    return this.page.locator('footer').first();
  }

  get navLinks(): Locator {
    return this.page.locator('a').filter({ hasText: /make-up|parfum|pflege|haar|marken|sale/i });
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
  }
}
