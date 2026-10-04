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
    // Attempt standard accept/reject buttons
    if (
      await this.rejectOptionalButton
        .isVisible({ timeout: 1000 })
        .catch(() => false)
    ) {
      await this.rejectOptionalButton.click();
      return;
    }

    if (
      await this.settingsOrRejectLink
        .isVisible({ timeout: 1000 })
        .catch(() => false)
    ) {
      await this.settingsOrRejectLink.click();

      const rejectAllButton = this.page.getByRole('button', {
        name: /alle ablehnen|auswahl speichern|nur notwendige/i,
      });

      if (
        await rejectAllButton.isVisible({ timeout: 2000 }).catch(() => false)
      ) {
        await rejectAllButton.click();
      }
      return;
    }
    
    // Fallback for custom beautywelt staging cookie banner which uses spans and divs without text
    console.log("CookieBannerComponent: Trying custom fallback...");
    const customSettingsSpan = this.page.locator('span').filter({ hasText: /^Einstellungen oder Ablehnen$/i });
    if (await customSettingsSpan.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("CookieBannerComponent: Found settings span, clicking...");
      await customSettingsSpan.click();
      // The save button is an icon in a div without text
      const saveIcon = this.page.locator('.bwye .bwv6').first();
      if (await saveIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log("CookieBannerComponent: Found save icon, clicking...");
        await saveIcon.click();
        console.log("CookieBannerComponent: Clicked save icon!");
      }
    }
  }
}
