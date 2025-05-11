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

export const ACTIVITY_SSE_SECRET = process.env.ACTIVITY_SSE_SECRET;
if (!ACTIVITY_SSE_SECRET) {
  console.error("Missing environment variable: ACTIVITY_SSE_SECRET");
  process.exit(1);
}
