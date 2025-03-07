export function generateTokens(fastify, account_id) {
    return {
        access_token: fastify.jwt.sign({ account_id }, { expiresIn: "15m" }),
        expire_at: new Date(new Date().getTime() + 15 * 60000),
        refresh_token: fastify.jwt.refresh.sign({ account_id }, { expiresIn: "7d" })
    }
}
