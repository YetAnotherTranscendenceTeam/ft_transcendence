export const AUTHENTICATION_SECRET = process.env.AUTHENTICATION_SECRET;
if (!AUTHENTICATION_SECRET) {
  console.error("Missing environment variable: AUTHENTICATION_SECRET");
  process.exit(1);
}

export const SPECTATOR_SECRET = process.env.SPECTATOR_SECRET;
if (!SPECTATOR_SECRET) {
  console.error("Missing environment variable: SPECTATOR_SECRET");
  process.exit(1);
}
