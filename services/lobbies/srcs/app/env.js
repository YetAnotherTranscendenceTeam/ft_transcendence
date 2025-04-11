export const AUTHENTICATION_SECRET = process.env.AUTHENTICATION_SECRET;
if (!AUTHENTICATION_SECRET) {
  console.error("Missing environment variable: AUTHENTICATION_SECRET");
  process.exit(1);
}
export const matchmaking_jwt_secret = process.env.MATCHMAKING_JWT_SECRET;
if (!matchmaking_jwt_secret) {
  console.error("Missing environment variable: MATCHMAKING_JWT_SECRET");
  process.exit(1);
}
