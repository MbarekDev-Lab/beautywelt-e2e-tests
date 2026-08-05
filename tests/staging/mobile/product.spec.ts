import { test } from '../../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

test.beforeEach(async ({ baseURL }): Promise<void> => {
  requireAuthorizedStaging(baseURL);
});
