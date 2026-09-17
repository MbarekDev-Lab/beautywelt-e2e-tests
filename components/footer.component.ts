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

    // The footer has three zones with partially overlapping links:
    //   1. Customer-service <section> blocks (e.g. /Versandkosten in a <ul>)
    //   2. Legal bar at the bottom (/Datenschutz, /Impressum, /AGB, /Widerrufsrecht)
    //   3. MwSt disclaimer line (another /Versandkosten as "zzgl. Versand")
    //
    // Scope each locator to the first visible match within the footer
    // to avoid ambiguity from structural duplicates.

    // Legal bar links — unique within the footer, but use .first() defensively.
    this.privacyLink = this.root.locator('a[href="/Datenschutz"]').first();

    this.imprintLink = this.root.locator('a[href="/Impressum"]').first();

    this.termsLink = this.root.locator('a[href="/AGB"]').first();

    this.withdrawalLink = this.root
      .locator('a[href="/Widerrufsrecht"]')
      .first();

    // Customer-service links — scope to the <ul> list items to avoid the
    // "zzgl. Versand" disclaimer link and the header "Offizieller Händler" link.
    const serviceList = this.root.locator('section ul');

    this.shippingLink = serviceList.locator('a[href="/Versandkosten"]').first();

    this.paymentLink = serviceList
      .locator('a[href="/Zahlungsmoeglichkeiten"]')
      .first();

    this.accessibilityLink = serviceList
      .locator('a[href="/barrierefreiheit"]')
      .first();
  }
}
