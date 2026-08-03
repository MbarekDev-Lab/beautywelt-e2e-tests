import 'dotenv/config';

export const validUser = {
  email: process.env.VALID_USER_EMAIL ?? 'fallbackkUser',
  password: process.env.VALID_USER_PASSWORD ?? 'fallbackPassword',
};
