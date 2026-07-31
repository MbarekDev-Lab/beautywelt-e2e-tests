import { Page } from '@playwright/test';
import { CookieBannerComponent } from '../components/cookie-banner.component';

export class BasePage {
  readonly cookieBanner: CookieBannerComponent;

  constructor(protected readonly page: Page) {
    this.cookieBanner = new CookieBannerComponent(page);
  }

  async gotoHome(): Promise<void> {
    await this.page.goto('/');
  }

  async waitForMainContent(): Promise<void> {
    // Avoid .first() unless position is a documented requirement. Use a specific accessible role.
    await this.page.getByRole('main').waitFor({ state: 'visible' });
  }








  
}
