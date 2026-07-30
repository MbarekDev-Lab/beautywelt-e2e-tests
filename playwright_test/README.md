# Beautywelt Playwright E2E Suite

This project contains a CI-ready Playwright + TypeScript framework for exercising the Beautywelt storefront.

## Setup

1. Install dependencies:
   ```bash
   npm install
   npx playwright install
   ```
2. Copy the environment example:
   ```bash
   cp .env.example .env
   ```
3. Review the required variables in `.env`.

## Environment variables

- `BASE_URL` – the Beautywelt base URL (defaults to `https://www.beautywelt.de`)

## Run tests

- Smoke suite:
  ```bash
  npx playwright test --grep @smoke
  ```
- Regression suite:
  ```bash
  npx playwright test --grep @regression
  ```
- Accessibility suite:
  ```bash
  npx playwright test --grep @a11y
  ```
- All tests:
  ```bash
  npx playwright test
  ```

## Project structure

- `tests/` – tagged test suites
- `pages/` – page objects for the POM pattern
- `fixtures/` – shared Playwright fixtures
