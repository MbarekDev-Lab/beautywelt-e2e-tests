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

    // The home link title differs between environments:
    // "Beautywelt Startseite" (production) vs "Haarpflege-Beauty Startseite" (staging).
    this.homeLink = this.root.locator(
      'a[title*="Startseite"][href="/"]',
    ).first();

    this.logo = this.root
      .locator(
        'img[alt*="Beautywelt" i], img[alt*="Haarpflege" i], img[src*="logo" i]',
      )
      .first();

    this.mobileMenuButton = this.root.getByRole('button', {
      name: /open burger menu/i,
    });

    this.cartLink = this.root.getByRole('link', { name: /Warenkorb/i }).first();

    // Two account links exist (mobile nav + desktop nav); use .first().
    this.accountLink = this.root.locator(
      'a[href="/jtl.php"][title="Anmelden"]',
    ).first();

    // The header contains two nav bars with identical category links:
    //   • nav#bweu  — collapsed mobile burger menu
    //   • nav.bwe3  — visible desktop horizontal category bar
    // Scope to the desktop nav to avoid double-counting.
    const desktopNav = this.root.locator('nav.bwe3');

    this.primaryCategories = desktopNav.locator(
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
