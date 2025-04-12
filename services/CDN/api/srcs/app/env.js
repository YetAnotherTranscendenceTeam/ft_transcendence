"use strict";

export const CDN_SECRET = process.env.CDN_SECRET;
if (!CDN_SECRET) {
  console.error("Missing environment variable: CDN_SECRET");
  process.exit(1);
}
