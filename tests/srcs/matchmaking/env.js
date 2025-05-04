export const MATCHMAKING_SECRET = process.env.MATCHMAKING_SECRET;
if (!MATCHMAKING_SECRET) {
  console.error("Missing environment variable: MATCHMAKING_SECRET");
  process.exit(1);
}

export const MATCH_MANAGEMENT_SECRET = process.env.MATCH_MANAGEMENT_SECRET;
if (!MATCH_MANAGEMENT_SECRET) {
  console.error("Missing environment variable: MATCH_MANAGEMENT_SECRET");
  process.exit(1);
}
