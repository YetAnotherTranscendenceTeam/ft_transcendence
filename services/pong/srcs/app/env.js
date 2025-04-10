export const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
  console.error("Missing environment variable: JWT_SECRET");
  process.exit(1);
}

export const match_management_jwt_secret = process.env.MATCH_MANAGEMENT_JWT_SECRET;
if (!match_management_jwt_secret) {
  console.error("Missing environment variable: MATCH_MANAGEMENT_JWT_SECRET");
  process.exit(1);
}
