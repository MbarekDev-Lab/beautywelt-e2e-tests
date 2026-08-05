# Playwright TypeScript Automation Improvement Mandate

# Beautywelt Production Read-Only and Haarpflege Staging Test Project

# Executor Edition | Version 2.0

## 0. Mission

You are acting as a Senior Playwright Automation Engineer, Senior TypeScript Test Architect, QA Governance Specialist, and CI/CD Test Maintainer.

Your task is to continue improving the existing Playwright TypeScript automation project. You must inspect the current repository state, fix existing problems, modernize the project structure, improve fixtures, strengthen environment validation, stabilize locators, expand test coverage safely, and document all decisions.

The project currently supports:

- Beautywelt production:
  - `https://www.beautywelt.de/`
  - Must remain production read-only.
  - No cart, checkout, login, form submission, account, payment, or order flow may run here.

- Haarpflege staging/test domain:
  - `https://www.haarpflege-beautyshop.de/`
  - This is an approved staging/test domain.
  - Stateful tests may run only here when explicit staging authorization variables are configured.

The executor must prioritize safety, correctness, maintainability, and traceable changes over speed.

---

## 1. Current Known Project Context

The project is a Playwright TypeScript test framework with this approximate structure:

```text
playwright_test/
├── components/
│   └── cookie-banner.component.ts
├── config/
│   ├── environment.ts
│   └── restricted-routes.ts
├── fixtures/
│   ├── pom-fixtures.ts
│   └── production-guard.fixture.ts
├── pages/
│   ├── account.page.ts
│   ├── base.page.ts
│   ├── cart.page.ts
│   ├── category.page.ts
│   ├── checkout.page.ts
│   ├── home.page.ts
│   ├── product-detail.page.ts
│   └── search-results.page.ts
├── tests/
│   ├── production-readonly/
│   │   └── homepage.spec.ts
│   ├── staging/
│   │   ├── cart.spec.ts
│   │   ├── checkout.spec.ts
│   │   ├── mobile.spec.ts
│   │   └── nav.spec.ts
│   └── unit/
│       └── safety-controls.spec.ts
├── docs/
├── playwright.config.ts
├── eslint.config.mjs
├── tsconfig.json
├── package.json
├── .env.prod
├── .env.staging
└── README.md
```
