#Authorization Policy

## 1. Requirement for Authorization

Testing state-changing features (cart modifications, placing orders, accounts) requires explicit written
authorization and is typically constrained to a dedicated **Staging Environment**.

## 2. Staging Execution

To run state-changing tests, you must:

1. Provide a `BASE_URL` pointing to the designated staging instance (not production).
2. Set `TARGET_ENV=staging`.
3. Set `ALLOW_STATE_CHANGES=true`.
4. Run the staging specifically using `npm run test:staging`.

Production environments are strictly hardcoded to reject `ALLOW_STATE_CHANGES=true`.
Public availability of the production URL does NOT imply authorization for transactional testing.
