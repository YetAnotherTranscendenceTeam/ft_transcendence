"use strict";

export const frontend_url = process.env.FRONTEND_URL;
if (!frontend_url) {
  console.error("Missing environment variable: FRONTEND_URL");
  process.exit(1);
}

export const token_manager_secret = process.env.TOKEN_MANAGER_SECRET;
if (!token_manager_secret) {
  console.error("Missing environment variable: TOKEN_MANAGER_SECRET");
  process.exit(1);
}

export const google_client_id = process.env.GOOGLE_CLIENT_ID;
if (!google_client_id) {
  console.error("Missing environment variable: GOOGLE_CLIENT_ID");
  process.exit(1);
}
