import type { Locator, Page } from '@playwright/test';

/** CSS selector for the Beautywelt cookie-consent overlay container. */
const COOKIE_OVERLAY_SELECTOR = '.bwa10.bwin, .bwa10';

/** Probe timeout used for individual locator visibility checks. */
const PROBE_TIMEOUT_MS = 3_000;

export class CookieBannerComponent {
  /**
   * Matches both the accept-all button ("Alle akzeptieren") and the
   * necessary-only / reject buttons so we can dismiss the banner regardless
   * of which CMP variant is shown on staging.
   */
  readonly primaryDismissButton: Locator;
  readonly settingsOrRejectLink: Locator;

  /** @deprecated Use primaryDismissButton instead. */
  get rejectOptionalButton(): Locator {
    return this.primaryDismissButton;
  }

  constructor(private readonly page: Page) {
    // Accept-all and necessary-only patterns are intentionally combined so
    // that whichever button the staging CMP renders is handled.
    this.primaryDismissButton = page.getByRole('button', {
      name: /alle akzeptieren|alle ablehnen|nur notwendige|notwendige cookies/i,
    });

    this.settingsOrRejectLink = page.getByRole('link', {
      name: /einstellungen oder ablehnen/i,
    });
  }

  async dismissIfPresent(): Promise<void> {
    // Strategy 1: Primary CMP button ("Alle akzeptieren" / "Alle ablehnen" / "Nur notwendige")
    if (
      await this.primaryDismissButton
        .first()
        .isVisible({ timeout: PROBE_TIMEOUT_MS })
        .catch(() => false)
    ) {
      await this.primaryDismissButton.first().click();
      await this._waitForOverlayGone();
      return;
    }

    // Strategy 2: "Einstellungen oder Ablehnen" link → secondary panel → save
    if (
      await this.settingsOrRejectLink
        .isVisible({ timeout: PROBE_TIMEOUT_MS })
        .catch(() => false)
    ) {
      await this.settingsOrRejectLink.click();

      const secondaryButton = this.page.getByRole('button', {
        name: /alle ablehnen|auswahl speichern|nur notwendige|alle akzeptieren/i,
      });

      if (
        await secondaryButton
          .first()
          .isVisible({ timeout: PROBE_TIMEOUT_MS })
          .catch(() => false)
      ) {
        await secondaryButton.first().click();
      }

      await this._waitForOverlayGone();
      return;
    }

    // Strategy 3: Beautywelt staging banner rendered as spans/icons (no accessible text)
    console.log('CookieBannerComponent: Trying custom fallback...');
    const customSettingsSpan = this.page
      .locator('span')
      .filter({ hasText: /^Einstellungen oder Ablehnen$/i });

    if (
      await customSettingsSpan
        .isVisible({ timeout: PROBE_TIMEOUT_MS })
        .catch(() => false)
    ) {
      console.log('CookieBannerComponent: Found settings span, clicking...');
      await customSettingsSpan.click();

      const saveIcon = this.page.locator('.bwye .bwv6').first();
      if (await saveIcon.isVisible({ timeout: PROBE_TIMEOUT_MS }).catch(() => false)) {
        console.log('CookieBannerComponent: Found save icon, clicking...');
        await saveIcon.click();
        console.log('CookieBannerComponent: Clicked save icon!');
        await this._waitForOverlayGone();
        return;
      }
    }

    // Strategy 4: Hard DOM removal – last resort to unblock pointer events.
    const overlay = this.page.locator(COOKIE_OVERLAY_SELECTOR).first();
    if (await overlay.isVisible({ timeout: 1_000 }).catch(() => false)) {
      console.log(
        'CookieBannerComponent: Removing overlay via DOM evaluation (last resort).',
      );
      await overlay.evaluate((el) => el.remove()).catch(() => {});
      await this._waitForOverlayGone();
    }
  }

  /** Waits up to 5 s for the overlay container to disappear from the DOM. */
  private async _waitForOverlayGone(): Promise<void> {
    await this.page
      .locator(COOKIE_OVERLAY_SELECTOR)
      .first()
      .waitFor({ state: 'hidden', timeout: 5_000 })
      .catch(() => {});
  }
}
