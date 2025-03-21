export const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
  console.error("Missing environment variable: JWT_SECRET");
  process.exit(1);
}

export const offline_delay = process.env.SOCIAL_INACTIVITY_DELAY || 10000

export const inactivity_delay = process.env.SOCIAL_INACTIVITY_DELAY || 15000
