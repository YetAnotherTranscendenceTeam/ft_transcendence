"user strict";

export const CDN_URL = process.env.CDN_URL;
if (!CDN_URL) {
  console.error("Missing environment variable: CDN_URL");
  process.exit(1);
}

export const CDN_SECRET = process.env.CDN_SECRET;
if (!CDN_SECRET) {
  console.error("Missing environment variable: CDN_SECRET");
  process.exit(1);
}
