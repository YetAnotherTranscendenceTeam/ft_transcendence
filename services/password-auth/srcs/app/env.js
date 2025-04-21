"use strict";

export const TOKEN_MANAGER_SECRET = process.env.TOKEN_MANAGER_SECRET;
if (!TOKEN_MANAGER_SECRET) {
  console.error("Missing environment variable: TOKEN_MANAGER_SECRET");
  process.exit(1);
}

export const TWO_FA_SECRET = process.env.TWO_FA_SECRET
if (!TWO_FA_SECRET) {
  console.error("Missing environment variable: TWO_FA_SECRET");
  process.exit(1);
}

export const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER
if (!PASSWORD_PEPPER) {
  console.error("Missing environment variable: PASSWORD_PEPPER");
  process.exit(1);
}

export const AUTH_2FA_SECRET = process.env.AUTH_2FA_SECRET;
if (!AUTH_2FA_SECRET) {
  console.error("Missing environment variable: AUTH_2FA_SECRET");
  process.exit(1);
}
