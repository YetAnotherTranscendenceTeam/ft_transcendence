export const AUTHENTICATION_SECRET = process.env.AUTHENTICATION_SECRET;
if (!AUTHENTICATION_SECRET) {
  console.error("Missing environment variable: AUTHENTICATION_SECRET");
  process.exit(1);
}

export const TWO_FA_SECRET = process.env.TWO_FA_SECRET;
if (!TWO_FA_SECRET) {
  console.error("Missing environment variable: TWO_FA_SECRET");
  process.exit(1);
}
