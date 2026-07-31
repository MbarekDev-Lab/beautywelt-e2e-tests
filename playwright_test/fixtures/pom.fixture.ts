import { test as base } from '@playwright/test';
import PomManager from '../pom/pom-manager';

//import { validateEnvironment } from '../config/environment';
import { validUser } from '../test-data/validUser';


type PomFixture = {
    pom: PomManager;
    validUser: { username: string; password: string };
    //validUser: typeof validUser;
};


export const test = base.extend<PomFixture>({
    pom: async ({ page }, use) => {
        const pomManager = new PomManager(page);
        await use(pomManager);
    },

    /*validUser: async ({ }, use) => {
        await use(validUser);
    }*/

    validUser,
});

export { expect } from '@playwright/test';

