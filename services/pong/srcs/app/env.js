export const AUTHENTICATION_SECRET = process.env.AUTHENTICATION_SECRET;
if (!AUTHENTICATION_SECRET) {
  console.error("Missing environment variable: AUTHENTICATION_SECRET");
  process.exit(1);
}

export const MATCH_MANAGEMENT_SECRET = process.env.MATCH_MANAGEMENT_SECRET;
if (!MATCH_MANAGEMENT_SECRET) {
  console.error("Missing environment variable: MATCH_MANAGEMENT_SECRET");
  process.exit(1);
}
