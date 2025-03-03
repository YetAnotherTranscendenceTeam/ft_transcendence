export const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
  console.error("Missing environment variable: JWT_SECRET");
  process.exit(1);
}

export const cdn_jwt_secret = process.env.CDN_JWT_SECRET;
if (!cdn_jwt_secret) {
  console.error("Missing environment variable: CDN_JWT_SECRET");
  process.exit(1);
}

export const cdn_url = process.env.CDN_URL;
if (!cdn_jwt_secret) {
  console.error("Missing environment variable: CDN_URL");
  process.exit(1);
}
