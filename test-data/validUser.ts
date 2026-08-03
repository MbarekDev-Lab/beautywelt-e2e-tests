import 'dotenv/config';

export const validUser = {
  email: process.env.VALID_USER_EMAIL ?? 'fallbackUser',
  password: process.env.VALID_USER_PASSWORD ?? 'fallbackPassword',
};
