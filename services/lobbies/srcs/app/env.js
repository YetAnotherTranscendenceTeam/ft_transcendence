export const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
  console.error("Missing environment variable: JWT_SECRET");
  process.exit(1);
}
export const matchmaking_jwt_secret = process.env.MATCHMAKING_JWT_SECRET;
if (!matchmaking_jwt_secret) {
  console.error("Missing environment variable: MATCHMAKING_JWT_SECRET");
  process.exit(1);
}
