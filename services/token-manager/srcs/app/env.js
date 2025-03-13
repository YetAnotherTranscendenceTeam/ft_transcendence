export const token_manager_secret = process.env.TOKEN_MANAGER_SECRET;
if (!token_manager_secret) {
    console.error("Missing environment variable: TOKEN_MANAGER_SECRET");
    process.exit(1);
}

export const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) {
    console.error("Missing environment variable: JWT_SECRET");
    process.exit(1);
}

export const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
if (!refresh_token_secret) {
    console.error("Missing environment variable: REFRESH_TOKEN_SECRET");
    process.exit(1);
}
