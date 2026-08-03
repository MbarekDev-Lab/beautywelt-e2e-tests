# Playwright E2E Test Automation — AI Agent Brief: Beautywelt.de

## How to use this document

Everything below the line marked **"COPY FROM HERE"** is written to hand directly to your AI coding agent
(Claude Code, Cursor, Windsurf, or similar) as its task brief. The notes above that line are for you.

## ⚠️ Before running this against production

Beautywelt.de's `robots.txt` disallows automated access — a signal aimed at bots and crawlers, but worth respecting either way. If you're not the site's owner,
an employee/contractor, or otherwise authorized to test it, confirm that first, or retarget the suite at a staging/sandbox environment instead.
I couldn't browse the live DOM myself for the same reason, so the selectors below are German-e-commerce-convention best guesses — the brief includes a step for your agent
to confirm real ones on the live site.

## Assumptions (override any of these directly in the prompt below)

- **Language/tooling:** TypeScript + `@playwright/test` (swap for JS if you prefer)
- **Checkout scope:** tests stop at "review order" — never submits a real payment
- **Target:** production URL directly — swap `BASE_URL` if you have a staging domain
- **Browser coverage:** Chromium for full regression; Firefox/WebKit/mobile for smoke only, to balance thoroughness against run time

---

## COPY FROM HERE ↓

You are a **Senior QA Automation Engineer** specializing in Playwright with TypeScript, the Page Object Model (POM) pattern, and CI-ready end-to-end test architecture for e-commerce applications.

### Context

The target application is **https://www.beautywelt.de/**, a German online perfumery and cosmetics retailer selling fragrances, skincare, make-up,
and hair care/styling products across brands like Dior, Lancôme, L'Oréal, and Sisley. Core flows include category browsing, search, filtering/sorting,
a shopping cart, guest and account checkout (payment options likely include invoice via Ratepay, PayPal, and card), account registration/login, and newsletter signup.
Expect a GDPR cookie-consent banner on first load and all UI text in German.

**Ground rules — hold these regardless of what else changes:**

- Never submit a real payment or place a real order. Stop at the final review/summary step and assert its contents.
- Generate all form data (names, emails, addresses) with `@faker-js/faker`. Never use real personal or payment data.
- Keep the suite's footprint on the live site reasonable — no high-parallelism load testing against production.
- Confirm real selectors by exploring the live site yourself first (`npx playwright codegen https://www.beautywelt.de`) rather than assuming the German label guesses below are exact.

### Objective

Build a maintainable, CI-ready Playwright + TypeScript E2E framework covering the critical shopping journey, structured around the Page Object Model, with tagged suites
(`@smoke`, `@regression`, `@a11y`) so subsets can run independently.

### Tech stack

- `@playwright/test` + TypeScript
- Page Object Model with a `BasePage` class for shared concerns (cookie banner, nav)
- `@faker-js/faker` for all test data
- `@axe-core/playwright` for accessibility smoke checks
- `playwright.config.ts`: `BASE_URL` from `.env`; projects for Chromium (full suite) + Firefox/WebKit + one mobile viewport (smoke only)
- Reporters: HTML (local) + JUnit (CI); trace/video/screenshot retained on failure only

### Scope — build in this order

**1. Smoke suite (`@smoke` — fast and stable above all)**

- Homepage loads: correct title; header, nav, search, footer all render
- Cookie banner appears and can be dismissed
- Search for a known brand/term returns relevant results
- Opening a product from results shows name, price, and an add-to-cart control
- Add to cart updates the cart badge/count
- Cart page shows the item with the correct line total

**2. Category & navigation (`@regression`)**

- Each main nav category (confirm live labels — likely Parfum/Düfte, Pflege, Make-up, Haarpflege, Marken, Sale) opens a listing with products
- Filters (brand, price, product type) narrow results and update the count
- Sort options (price, relevance/bestseller) reorder the listing
- Pagination or infinite scroll loads additional products correctly

**3. Product detail page**

- Image, name, price, brand, and description render
- Variant selection (size/scent, if present) updates price/availability
- Add-to-wishlist (if present) and add-to-cart both work
- Out-of-stock products show the correct disabled state

**4. Cart**

- Quantity change recalculates the line total and subtotal
- Removing an item updates the cart; the empty-cart state displays once emptied
- Voucher/discount code field shows valid/invalid feedback
- "Proceed to checkout" navigates correctly

**5. Checkout (stop before payment submission)**

- Guest checkout: address form validates required fields, email format, postal code format
- Logged-in checkout: saved address pre-fills correctly
- Shipping method selection updates the order total
- Payment method selection (invoice/Ratepay, PayPal, card) is selectable and reflected in the summary
- Final review page shows correct items, shipping, and total — **assert here, do not submit**

**6. Account**

- Registration form validation (required fields, password rules, duplicate-email handling)
- Login: valid credentials succeed, invalid credentials show an error
- "Forgot password" request shows a confirmation state (don't validate actual email delivery)
- Logout clears session state

**7. Newsletter & footer**

- Newsletter signup validates input and confirms success
- Footer links (Impressum, AGB, Datenschutz, Kontakt) resolve without 404s

**8. Cross-cutting (`@a11y` / non-functional)**

- Responsive layout check at mobile, tablet, and desktop viewports
- No critical console errors on homepage, PLP, or PDP
- `axe-core` scan on homepage, one category page, and one product page — flag critical violations
- Nav-link smoke check for broken links

### Likely German UI text (confirm on the live site — treat as a starting point, not fact)

| Element       | Likely text                                      |
| ------------- | ------------------------------------------------ |
| Cookie accept | "Akzeptieren" / "Alle akzeptieren" / "Zustimmen" |
| Add to cart   | "In den Warenkorb"                               |
| Cart          | "Warenkorb"                                      |
| Checkout      | "Zur Kasse" / "Kasse"                            |
| Login         | "Anmelden" / "Mein Konto"                        |
| Register      | "Registrieren" / "Konto erstellen"               |
| Newsletter    | "Newsletter anmelden"                            |

### Project structure

```
beautywelt-e2e/
├── tests/
│   ├── smoke/smoke.spec.ts
│   ├── navigation/category-listing.spec.ts
│   ├── product/product-detail.spec.ts
│   ├── cart/cart.spec.ts
│   ├── checkout/checkout.spec.ts
│   ├── account/account.spec.ts
│   └── a11y/accessibility.spec.ts
├── pages/
│   ├── base.page.ts
│   ├── home.page.ts
│   ├── search-results.page.ts
│   ├── category.page.ts
│   ├── product-detail.page.ts
│   ├── cart.page.ts
│   ├── checkout.page.ts
│   └── account.page.ts
├── fixtures/
│   ├── test-fixtures.ts
│   └── test-data.ts
├── playwright.config.ts
├── .env.example
├── package.json
└── README.md
```

### Style reference (match this pattern)

```typescript
// pages/base.page.ts
import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async acceptCookiesIfPresent() {
    const acceptBtn = this.page.getByRole('button', {
      name: /akzeptieren|zustimmen/i,
    });
    if (await acceptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await acceptBtn.click();
    }
  }
}
```

```typescript
// tests/smoke/smoke.spec.ts
import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Smoke @smoke', () => {
  test('homepage loads with key elements', async ({ page, homePage }) => {
    await page.goto('/');
    await homePage.acceptCookiesIfPresent();
    await expect(page).toHaveTitle(/Beautywelt/i);
    await expect(homePage.searchInput).toBeVisible();
  });
});
```

### Coding standards

- Selectors: prefer `getByRole` / `getByLabel` / `getByText` over CSS or XPath; use `data-testid` only if the site actually ships one
  (it likely doesn't — document real selectors as you discover them)
- No `waitForTimeout` — rely on Playwright's auto-waiting and web-first `expect(...)` assertions
- Every test runs independently; no shared state across tests
- All test data generated at runtime via faker; nothing hardcoded, no real personal or payment data
- Tag tests (`@smoke`, `@regression`, `@a11y`) in titles for selective runs
- `BASE_URL` read only from `.env`, never hardcoded in a spec file

### CI

Provide a GitHub Actions workflow that runs `@smoke` on every push/PR and full `@regression` only on a manual
or nightly trigger — not on every commit, to keep load on the production site reasonable.

### Deliverables

1. Full project matching the structure above
2. Page Objects for every flow in scope
3. Smoke suite fully implemented and passing locally
4. `README.md` covering setup, how to run each tag, and required env vars
5. `.env.example` with `BASE_URL=https://www.beautywelt.de`
6. Sample `.github/workflows/playwright.yml`

### Definition of done

- `npm install && npx playwright install && npx playwright test --grep @smoke` passes against the live site
- Zero hardcoded waits; three consecutive clean local runs with no flake
- A new developer can set up and run the suite from the README alone in under 5 minutes

## COPY UP TO HERE ↑
