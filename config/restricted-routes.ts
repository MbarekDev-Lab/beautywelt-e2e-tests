export const RESTRICTED_PRODUCTION_ROUTES: RegExp[] = [
  /\/warenkorb\.php(?:\/|$|\?)/i,
  /\/bestellvorgang\.php(?:\/|$|\?)/i,
  /\/bestellabschluss\.php(?:\/|$|\?)/i,
  /\/registrieren\.php(?:\/|$|\?)/i,
  /\/pass\.php(?:\/|$|\?)/i,
  /\/jtl\.php(?:\/|$|\?)/i,
  /\/dbeS(?:\/|$)/i,
  /\/docs(?:\/|$)/i,
  /\/vkpro-connector(?:\/|$)/i,
  /\/cgi-bin(?:\/|$)/i,
];
