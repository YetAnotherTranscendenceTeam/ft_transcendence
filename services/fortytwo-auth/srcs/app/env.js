"use strict";

export const API42_CLIENT_ID = process.env.API42_CLIENT_ID;
if (!API42_CLIENT_ID) {
    console.error("Missing environment variable: API42_CLIENT_ID");
    process.exit(1);
}

export const API42_SECRET = process.env.API42_SECRET;
if (!API42_SECRET) {
    console.error("Missing environment variable: API42_SECRET");
    process.exit(1);
}

export const API42_REDIRECT_URI = process.env.API42_REDIRECT_URI;
if (!API42_REDIRECT_URI) {
  console.error("Missing environment variable: API42_REDIRECT_URI");
  process.exit(1);
}

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

export const AUTH_2FA_SECRET = process.env.AUTH_2FA_SECRET;
if (!AUTH_2FA_SECRET) {
  console.error("Missing environment variable: AUTH_2FA_SECRET");
  process.exit(1);
}
