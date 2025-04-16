export const AUTHENTICATION_SECRET = process.env.AUTHENTICATION_SECRET;
if (!AUTHENTICATION_SECRET) {
  console.error("Missing environment variable: AUTHENTICATION_SECRET");
  process.exit(1);
}

export const offline_delay = process.env.SOCIAL_OFFLINE_DELAY || 30 * 1000 // Defaults to 30sec

export const inactivity_delay = process.env.SOCIAL_INACTIVITY_DELAY || 2 * 60 * 1000 // Defaults to 2min
