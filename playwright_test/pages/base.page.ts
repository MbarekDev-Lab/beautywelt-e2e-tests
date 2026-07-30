import { Locator, Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  get searchInput(): Locator {
    return this.page.getByLabel(/suchen in allen marken|suchen/i).first();
  }

  get cartLink(): Locator {
    return this.page.getByRole('link', { name: /warenkorb/i }).first();
  }

  async gotoHome(): Promise<void> {
    await this.page.goto('/');
  }

  async acceptCookiesIfPresent(): Promise<void> {
    const acceptButton = this.page.getByRole('button', { name: /alle akzeptieren|akzeptieren|zustimmen/i }).first();
    if (await acceptButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await acceptButton.click();
    }
  }

  async waitForMainContent(): Promise<void> {
    await this.page.locator('main').first().waitFor({ state: 'visible' });
  }
}
