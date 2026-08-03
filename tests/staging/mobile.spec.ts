import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 13'],
});

test('test', async ({ page }) => {
  await page.goto('https://www.beautywelt.de/');

  await page.locator('.bwv6').click();
  await page.getByRole('link', { name: 'Diesel' }).click();
  await page.getByRole('button', { name: 'In den Warenkorb' }).click();
  await page.getByRole('button', { name: 'Weiter einkaufen' }).click();
  await page.locator('.col-sm-6').first().click();
  await page.getByRole('img').nth(3).click();
  await page.locator('.bwqn > div:nth-child(2)').click();
  await page.locator('.bwqn > div:nth-child(4)').click();
  await page.locator('.bwqn > div:nth-child(8)').click();
  await page.getByRole('button', { name: 'Close (Esc)' }).click();
  await page.getByRole('button', { name: 'Kategorien' }).click();
  await page.getByRole('link', { name: 'Bad', exact: true }).click();
  await page.getByText('Kategorien').click();
  await page.getByRole('link', { name: 'D by Diesel' }).click();
  await page.getByText('Filter (2)').click();
  await page.locator('.bwk6').first().click();
  await page.getByText('Düfte (2)').click();
  await page.getByText('Übernehmen').click();
  await page.getByText('Filter (2)').click();
  await page.getByText('Duftrichtung').click();
  await page.getByText('holzig (1)').click();
  await page.getByText('Übernehmen').click();
  await page
    .getByRole('link', { name: 'Diesel D Red Eau de Parfum (' })
    .click();
  await page.getByRole('button', { name: 'In den Warenkorb' }).click();
  await page.getByRole('button', { name: 'Zum Warenkorb' }).click();
  await page.locator('input[name="anzahl[1]"]').click();
  await page.locator('input[name="anzahl[1]"]').fill('3');
  await page
    .getByRole('row', { name: 'Diesel D Red Eau de Parfum (' })
    .getByRole('button')
    .click();
  await page
    .getByRole('cell', { name: 'DHL - sichere Paketlieferung' })
    .click();
  await page.getByRole('link', { name: 'Zur Kasse' }).click();
  await page.locator('select[name="anrede"]').selectOption('m');
  await page.locator('input[name="vorname"]').click();
  await page.locator('input[name="vorname"]').fill('MBARE');
  await page.locator('input[name="vorname"]').press('CapsLock');
  await page.locator('input[name="vorname"]').fill('mbarek');
  await page.locator('input[name="nachname"]').click();
  await page.locator('input[name="nachname"]').fill('tester');
  await page.locator('select[name="land"]').selectOption('MC');
  await page.locator('input[name="plz"]').click();
  await page.locator('input[name="plz"]').fill('12345');
  await page.locator('input[name="ort"]').click();
  await page.locator('input[name="ort"]').click();
  await page.locator('input[name="ort"]').fill('2124444');
  await page.locator('input[name="strasse"]').click();
  await page.locator('input[name="strasse"]').fill('muster Str');
  await page.locator('input[name="hausnummer"]').click();
  await page.locator('input[name="hausnummer"]').fill('123');
  await page.locator('input[name="adresszusatz"]').click();
  await page.locator('input[name="adresszusatz"]').fill('Neu Adress');
  await page.locator('input[name="tel"]').click();
  await page.locator('input[name="tel"]').fill('0121545645');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .fill('a');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .press('Alt+d');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .fill('ae');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .fill('ddd');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .press('Alt+q');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .fill('ddd');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .press('Alt+q');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .fill('dddeeee');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .fill('nn');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .fill('test');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .press('Alt+ControlOrMeta+@');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .fill('testddd');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .press('Alt+ControlOrMeta+@');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .press('Alt+q');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('Passwort*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('Passwort*')
    .fill('@');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .fill('test');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .press('Alt+ControlOrMeta+@');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .fill('test');
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('E-Mail-Adresse*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('Passwort*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('Passwort*')
    .click();
  await page
    .getByRole('group')
    .filter({ hasText: 'Sie sind noch kein Kunde?' })
    .getByPlaceholder('Passwort*')
    .fill('@wwwww');
  await page.getByRole('button', { name: 'Kundendaten abschicken' }).click();
  await expect(
    page.getByRole('button', { name: 'Kundendaten abschicken' }),
  ).toBeVisible();
  await page.getByText('Packstation oder abweichende').click();
  await page
    .getByRole('radio', { name: 'Ohne Registrierung bestellen' })
    .check();
});
