export const jwt_matchmaking_secret = process.env.JWT_MATCHMAKING_SECRET;
if (!jwt_matchmaking_secret) {
  console.error("Missing environment variable: JWT_MATCHMAKING_SECRET");
  process.exit(1);
}
