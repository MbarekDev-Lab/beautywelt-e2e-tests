import type { Locator, Page } from '@playwright/test';

export class FooterComponent {
  readonly root: Locator;
  readonly privacyLink: Locator;
  readonly imprintLink: Locator;
  readonly termsLink: Locator;
  readonly withdrawalLink: Locator;
  readonly shippingLink: Locator;
  readonly paymentLink: Locator;
  readonly accessibilityLink: Locator;

  constructor(page: Page) {
    this.root = page.locator('footer#bwch');

    this.privacyLink = this.root.locator('a[href="/Datenschutz"]');

    this.imprintLink = this.root.locator('a[href="/Impressum"]');

    this.termsLink = this.root.locator('a[href="/AGB"]');

    this.withdrawalLink = this.root.locator('a[href="/Widerrufsrecht"]');

    this.shippingLink = this.root.locator('a[href="/Versandkosten"]');

    this.paymentLink = this.root.locator('a[href="/Zahlungsmoeglichkeiten"]');

    this.accessibilityLink = this.root.locator('a[href="/barrierefreiheit"]');
  }
}
