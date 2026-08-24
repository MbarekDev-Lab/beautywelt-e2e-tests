import type { Locator, Page, Response } from '@playwright/test';
import { expect } from '@playwright/test';

export type NavigationWaitUntil = 'commit' | 'domcontentloaded' | 'load' | 'networkidle';

export type MainContentWaitOptions = {
  readonly timeout?: number;
};

export class BasePage {
  protected readonly page: Page;

  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainContent = page.getByRole('main');
  }

  async goto( path: string, waitUntil: NavigationWaitUntil = 'domcontentloaded', ): Promise<Response | null> {
    return this.page.goto(path, { waitUntil, });
  }

  async gotoHome(): Promise<Response | null> {
    return this.goto('/');
  }

  async waitForMainContent( options: MainContentWaitOptions = {},): Promise<void> {
    await this.mainContent.waitFor({
      state: 'visible',
      timeout: options.timeout,
    });
  }

  async expectMainContentVisible(): Promise<void> {
    await expect(this.mainContent).toHaveCount(1);
    await expect(this.mainContent).toBeVisible();
  }

  async assertSuccessfulDocumentResponse( response: Response | null, purpose: string, ): Promise<void> {
    if (!response) {
      throw new Error(`${purpose} returned no document response.`);
    }

    const status = response.status();

    if (status === 401) {
      throw new Error(
        [
          `${purpose} returned HTTP 401 Unauthorized.`,
          'Verify HTTP Basic Authentication credentials,',
          'the canonical hostname, VPN access, IP allowlisting,',
          'and Playwright httpCredentials configuration.',
        ].join(' '),
      );
    }

    if (status === 403) {
      throw new Error(
        [
          `${purpose} returned HTTP 403 Forbidden.`,
          'Verify VPN access, IP allowlisting, proxy settings,',
          'and environment permissions.',
        ].join(' '),
      );
    }

    expect(status, `${purpose} returned HTTP ${status}.`).toBeLessThan(400);
  }

  async expectCurrentOrigin(expectedBaseURL: string): Promise<void> {
    const expectedOrigin = new URL(expectedBaseURL).origin;
    const currentOrigin = new URL(this.page.url()).origin;

    expect(
      currentOrigin,
      'The browser must remain on the expected environment origin.',
    ).toBe(expectedOrigin);
  }

  async dismissBlockingOverlays(): Promise<void> {
    const overlays = this.page.locator(
      ['[role="dialog"]', '[aria-modal="true"]', '.bwa10.bwin'].join(','),
    );

    // Give overlays a moment to appear
    await this.page.waitForTimeout(2000);

    const overlayCount = await overlays.count();
    for (let index = 0; index < overlayCount; index++) {
      const overlay = overlays.nth(index);

      if (!(await overlay.isVisible().catch(() => false))) {
        continue;
      }

      const closeOverlayRegex = /Schließen|Close|Ablehnen|Akzeptieren|Alle akzeptieren|Verstanden|Nein danke/i;
      const closeButton = overlay.getByRole('button', { name: closeOverlayRegex }).first();
      const closeLink = overlay.getByRole('link', { name: closeOverlayRegex }).first();

      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      } else if (await closeLink.isVisible().catch(() => false)) {
        await closeLink.click();
      } else {
        await overlay.evaluate((el) => el.remove()).catch(() => {});
      }

      await overlay.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }
  }
}
