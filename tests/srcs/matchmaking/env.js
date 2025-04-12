export const MATCHMAKING_SECRET = process.env.MATCHMAKING_SECRET;
if (!MATCHMAKING_SECRET) {
  console.error("Missing environment variable: MATCHMAKING_SECRET");
  process.exit(1);
}
