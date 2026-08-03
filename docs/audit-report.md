# Project Audit Report

## 1. Original Architecture

The project previously contained root-level JavaScript test files (`cart.spec.js`, `checkout.spec.js`, `homepage.spec.js`, etc.) using commonJS `require` statements.
Tests mixed assertions with arbitrary timeouts and targeted the live Beautywelt.de production URL.

## 2. Main Issues and Safety Risks

- **Mutations on Production**: Tests directly initiated `POST`, `DELETE`, and form submissions on `/warenkorb.php` and `/checkout.html` against `https://www.beautywelt.de`.
- **Hardcoded State**: The tests shared mutable state (e.g., clearing carts before tests using live API requests).
- **Code Quality**: Brittle locators (e.g., `.first()`, generic `.btn` classes), arbitrary sleeps (`waitForTimeout(500)`), missing TypeScript types,
  and unformatted JS code.

## 3. Changes Made

- Migrated entirely to strict **TypeScript** (`strict: true`).
- Restructured `pages/` to be cleaner and introduced `components/` for shared UI (e.g., Cookie Banner).
- Separated tests into `tests/production-readonly/` and `tests/staging/`.
- Deleted all old `.js` tests.
- Introduced strict safety guard rails (`config/environment.ts` and `fixtures/production-guard.fixture.ts`) blocking non-GET requests
  and restricted routes (`/warenkorb.php`, etc.)
  against production.
- Created budget constraints (1 worker, 0 retries).

## 4. Remaining Risks / Unverified Scenarios

- **Transactional Staging Tests**: The `cart` and `checkout` logic must be completely rewritten against a dedicated staging environment, using the `@staging` tag.
- **Selector Verification**: Many components inside transactional routes remain unverified, pending staging access.
