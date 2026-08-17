import type { Locator, Page } from '@playwright/test';

export class HeaderComponent {
  readonly root: Locator;
  readonly homeLink: Locator;
  readonly logo: Locator;
  readonly mobileMenuButton: Locator;
  readonly cartLink: Locator;
  readonly accountLink: Locator;
  readonly primaryCategories: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('banner');

    this.homeLink = this.root.locator(
      'a[title="Beautywelt Startseite"][href="/"]',
    );

    // Primary accessible-role locator by image name (preferred).
    // Add a resilient CSS-based fallback for cases where ARIA/accessibility
    // tree differs between environments or the accessible name is not set.
    this.logo = this.root
      .locator(
        'img[alt*="Beautywelt" i], img[alt*="Haarpflege" i], img[src*="logo" i], .logo img',
      )
      .first();

    this.mobileMenuButton = this.root.getByRole('button', {
      name: /open burger menu/i,
    });

    this.cartLink = this.root.getByRole('link', { name: /Warenkorb/i }).first();

    this.accountLink = this.root.locator(
      'a[href="/jtl.php"][title="Anmelden"]',
    );

    this.primaryCategories = this.root.locator(
      [
        'a[href="/parfuem"]',
        'a[href="/gesicht"]',
        'a[href="/koerper"]',
        'a[href="/make-up"]',
        'a[href="/haare"]',
        'a[href="/natur"]',
        'a[href="/maenner"]',
        'a[href="/drogerie"]',
        'a[href="/geschenke"]',
        'a[href="/sale"]',
      ].join(', '),
    );
  }

  async readCartBadgeCount(): Promise<number> {
    const rawValue = await this.cartLink.getAttribute('data-bwy2');

    if (!rawValue) {
      return 0;
    }

    const parsedValue = Number.parseInt(rawValue, 10);

    return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
  }
}
