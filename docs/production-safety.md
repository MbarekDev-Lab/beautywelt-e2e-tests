# Production Safety Policy

## 1. Overview

This project strictly separates production read-only checks from state-changing operations.

## 2. Allowed Production Actions

- Passive page loading (GET requests).
- Asserting on public text, visibility of landmarks, and existence of UI elements.
- Interacting inside an isolated local browser context with cookie consent UI.

## 3. Prohibited Production Actions

- Clicking any add-to-cart, checkout, newsletter, or form submission buttons.
- Mutating any state (account creation, login to live accounts, reviews, contacts).
- Accessing restricted paths.

## 4. Safety Controls

- **Production Hostname Detection**: The environment uses a `isProductionHost` rule to detect if the `BASE_URL` targets beautywelt.de or www.beautywelt.de.
- **Request Guard**: Intercepts `**/*` requests. Drops any restricted endpoints (`/warenkorb.php`, `/bestellvorgang.php`, etc.) and
  aborts any non-GET/HEAD/OPTIONS HTTP requests.
- **Budgeting**: Production tests are limited to a max test budget and navigation budget to prevent infinite crawling or load generation.
- **Execution Limits**: Playwright config is strictly limited to 1 worker, 0 retries, and no parallel execution.
