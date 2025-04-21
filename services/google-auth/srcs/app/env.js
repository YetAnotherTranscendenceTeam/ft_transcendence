"use strict";

export const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  console.error("Missing environment variable: FRONTEND_URL");
  process.exit(1);
}

export const TOKEN_MANAGER_SECRET = process.env.TOKEN_MANAGER_SECRET;
if (!TOKEN_MANAGER_SECRET) {
  console.error("Missing environment variable: TOKEN_MANAGER_SECRET");
  process.exit(1);
}

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  console.error("Missing environment variable: GOOGLE_CLIENT_ID");
  process.exit(1);
}

export const AUTH_2FA_SECRET = process.env.AUTH_2FA_SECRET;
if (!AUTH_2FA_SECRET) {
  console.error("Missing environment variable: AUTH_2FA_SECRET");
  process.exit(1);
}
