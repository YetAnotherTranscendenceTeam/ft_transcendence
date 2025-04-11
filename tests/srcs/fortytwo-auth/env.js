export const client_id = process.env.API42_CLIENT_ID;
if (!client_id) {
    console.error("Missing environment variable: API42_CLIENT_ID");
    process.exit(1);
}

export const redirect_uri = process.env.API42_REDIRECT_URI;
if (!redirect_uri) {
  console.error("Missing environment variable: API42_REDIRECT_URI");
  process.exit(1);
}

export const FRONTEND_URL = process.env.FRONTEND_URL;
if (!redirect_uri) {
  console.error("Missing environment variable: FRONTEND_URL");
  process.exit(1);
}
