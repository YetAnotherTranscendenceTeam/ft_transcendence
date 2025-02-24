"use strict";

export const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
  console.error("Missing environment variable: JWT_SECRET");
  process.exit(1);
}
