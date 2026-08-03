#Safe Playwright Automation Framework for Beautywelt.de

This is a **Production-Safe** Playwright automation framework targeting `beautywelt.de`. The project has been rigorously refactored to enforce a strict
boundary between passive production checks and transactional mutations (e.g. cart modification, checkout).

## Project Purpose & Authorization Boundary

We are building test software for `beautywelt.de`. However, we **do not** have authorization to perform state-changing or load-generating operations on
their production environment. The overriding rule of this framework is: **When safety and coverage conflict, choose safety.**

Fake information does NOT make a production submission safe.

## Production Read-Only Policy

- **No Mutations:** Tests in the production suite (`@production-readonly`) must only read public content, check layout/landmarks, and assert basic visibility.
- **Enforced Budgets:** Only 1 worker is used, with 0 retries. `test:production` strictly governs the navigation limits to avoid overloading the site.
- **Guarded Requests:** All tests are intercepted by `production-guard.fixture.ts`, completely dropping endpoints related to `/warenkorb.php`,
  `/bestellvorgang.php`, and more. Non-`GET`/`HEAD`/`OPTIONS` requests are strictly blocked.

## Required Software

- Node.js 20+
- npm

## Installation

```bash
npm install
npx playwright install --with-deps chromium
cp .env.example .env
```

## Environment Variables

The `.env` file should resemble `.env.example`:

```
BASE_URL=https://www.beautywelt.de/
TARGET_ENV=production
ALLOW_STATE_CHANGES=false
TEST_AUTHORIZATION_REFERENCE=
```

## Static Validation

Before any browser is opened, static validation must pass.

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test:list
```

## Execution Modes

### Production-Safe Execution

```bash
npm run test:production
```

Runs the strict `production-readonly` project.

### Staging Execution

```bash
npm run test:staging
```

Runs state-changing logic (e.g. adding items to a cart, filling checkouts) against an explicitly authorized staging environment. You must set
`TARGET_ENV=staging`, `ALLOW_STATE_CHANGES=true`, and provide a valid staging URL.

## Tag Usage

- `@production-readonly`: Tests completely safe to execute against production.
- `@staging @stateful @requires-authorization`: Tests that mutate state and MUST run against staging.

## Reports and Diagnostics

Test results are located in `playwright-report/` (HTML) and `reports/` (JUnit).
For the results of the internal refactoring and execution, view the following docs:

- `docs/audit-report.md`
- `docs/production-safety.md`
- `docs/authorization-policy.md`
- `docs/selector-audit.md`
- `docs/execution-report.md`

## Known Limitations & Adding Safe Tests

Unverified locators involving the cart and checkouts are isolated and await a dedicated staging URL.
If you need to add a test:

1. Is it safe to execute manually a thousand times against production? If no, use `@staging`.
2. Do not use `.first()` or bypass UI guards. Rely on strict, user-facing role matching (`getByRole`).
3. If checking a cookie banner, prefer rejection over blanket acceptance.
