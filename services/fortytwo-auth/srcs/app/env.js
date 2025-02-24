export const client_id = process.env.API42_CLIENT_ID;
if (!client_id) {
    console.error("Missing environment variable: API42_CLIENT_ID");
    process.exit(1);
}

export const client_secret = process.env.API42_SECRET;
if (!client_secret) {
    console.error("Missing environment variable: API42_SECRET");
    process.exit(1);
}

export const redirect_uri = process.env.API42_REDIRECT_URI;
if (!redirect_uri) {
  console.error("Missing environment variable: API42_REDIRECT_URI");
  process.exit(1);
}

export const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
  console.error("Missing environment variable: JWT_SECRET");
  process.exit(1);
}

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
