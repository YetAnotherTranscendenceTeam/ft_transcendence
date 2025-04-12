export const AUTHENTICATION_SECRET = process.env.AUTHENTICATION_SECRET;
if (!AUTHENTICATION_SECRET) {
  console.error("Missing environment variable: AUTHENTICATION_SECRET");
  process.exit(1);
}

export const TOKEN_MANAGER_SECRET = process.env.TOKEN_MANAGER_SECRET;
if (!TOKEN_MANAGER_SECRET) {
  console.error("Missing environment variable: TOKEN_MANAGER_SECRET");
  process.exit(1);
}
