import type { Locator, Page } from '@playwright/test';

export class CookieBannerComponent {
  readonly rejectOptionalButton: Locator;
  readonly settingsOrRejectLink: Locator;

  constructor(private readonly page: Page) {
    this.rejectOptionalButton = page.getByRole('button', {
      name: /alle ablehnen|nur notwendige|notwendige cookies/i,
    });

    this.settingsOrRejectLink = page.getByRole('link', {
      name: /einstellungen oder ablehnen/i,
    });
  }

  async dismissIfPresent(): Promise<void> {
    if ( await this.rejectOptionalButton.isVisible({ timeout: 1500 }).catch(() => false)) {
      await this.rejectOptionalButton.click();
      return;
    }

    if ( await this.settingsOrRejectLink.isVisible({ timeout: 1500 }).catch(() => false)) {
      await this.settingsOrRejectLink.click();

      const rejectAllButton = this.page.getByRole('button', {
        name: /alle ablehnen|auswahl speichern|nur notwendige/i,
      });

      if ( await rejectAllButton.isVisible({ timeout: 1500 }).catch(() => false)) {
        await rejectAllButton.click();
      }
    }
  }
}
