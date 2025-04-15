export const AUTHENTICATION_SECRET = process.env.AUTHENTICATION_SECRET;
if (!AUTHENTICATION_SECRET) {
  console.error("Missing environment variable: AUTHENTICATION_SECRET");
  process.exit(1);
}

export const MATCHMAKING_SECRET = process.env.MATCHMAKING_SECRET;
if (!MATCHMAKING_SECRET) {
  console.error("Missing environment variable: MATCHMAKING_SECRET");
  process.exit(1);
}

export const PONG_SECRET = process.env.PONG_SECRET;
if (!PONG_SECRET) {
  console.error("Missing environment variable: PONG_SECRET");
  process.exit(1);
}

export const matchmaking_scheduler_delay = process.env.MATCHMAKING_SCHEDULER_DELAY || 1000;
