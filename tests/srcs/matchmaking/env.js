export const matchmaking_jwt_secret = process.env.MATCHMAKING_JWT_SECRET;
if (!matchmaking_jwt_secret) {
  console.error("Missing environment variable: MATCHMAKING_JWT_SECRET");
  process.exit(1);
}
