export const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
  console.error("Missing environment variable: JWT_SECRET");
  process.exit(1);
}

export const jwt_matchmaking_secret = process.env.JWT_MATCHMAKING_SECRET;
if (!jwt_matchmaking_secret) {
  console.error("Missing environment variable: JWT_MATCHMAKING_SECRET");
  process.exit(1);
}

export const matchmaking_scheduler_delay = process.env.MATCHMAKING_SCHEDULER_DELAY;
if (!matchmaking_scheduler_delay) {
  console.error("Missing environment variable: MATCHMAKING_SCHEDULER_DELAY");
  process.exit(1);
}
