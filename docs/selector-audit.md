# Selector Audit

| Page/Component              | Element Purpose | Locator Expression                                   | Strategy             | Observed Accessible Name | Unique?    | Safe to verify? | Verification Result            |
| --------------------------- | --------------- | ---------------------------------------------------- | -------------------- | ------------------------ | ---------- | --------------- | ------------------------------ |
| HomePage                    | Search Input    | `getByRole('searchbox')`                             | Role-based           | "suchen"                 | Yes        | Yes             | **Verified**                   |
| HomePage                    | Main content    | `getByRole('main')`                                  | Role-based           | N/A                      | Yes        | Yes             | **Verified**                   |
| CookieBanner                | Reject Cookies  | `getByRole('button', { name: /ablehnen               | nur notwendige/i })` | Role+Name                | "ablehnen" | Yes             | Yes                            | **Unverified** |
| (Staging/Live pending auth) |
| Cart                        | Add to cart     | `getByRole('button', { name: /In den Warenkorb/i })` | Role+Name            | "In den Warenkorb"       | Yes        | No              | **Unverified** (Mutates state) |

_Note: As per the safety mandate, selectors that require interacting with state-changing flows (like Add to Cart) are left unverified against production._
