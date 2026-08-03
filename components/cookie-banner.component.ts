import { Locator, Page } from '@playwright/test';

export class CookieBannerComponent {
  readonly root: Locator;
  readonly rejectOptionalButton: Locator;

  constructor(private readonly page: Page) {
    // Note: These locators need to be verified in the browser against production.
    this.root = this.page
      .locator('#consent-banner')
      .or(this.page.getByRole('dialog', { name: /cookie|consent/i }));
    this.rejectOptionalButton = this.page.getByRole('button', {
      name: /ablehnen|nur notwendige|notwendige cookies/i,
    });
  }

  async dismissIfPresent(): Promise<void> {
    if (
      await this.rejectOptionalButton
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      await this.rejectOptionalButton.click();
    }
  }
}
