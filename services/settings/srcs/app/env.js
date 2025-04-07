export const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
  console.error("Missing environment variable: JWT_SECRET");
  process.exit(1);
}

export const token_manager_secret = process.env.TOKEN_MANAGER_SECRET;
if (!token_manager_secret) {
  console.error("Missing environment variable: TOKEN_MANAGER_SECRET");
  process.exit(1);
}

export const password_pepper = process.env.PASSWORD_PEPPER;
if (!password_pepper) {
  console.error("Missing environment variable: PASSWORD_PEPPER");
  process.exit(1);
}
