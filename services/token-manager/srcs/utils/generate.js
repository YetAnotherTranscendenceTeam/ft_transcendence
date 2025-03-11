import db from "../app/database.js"

export function generateTokens(fastify, account_id) {
  const access_token = fastify.jwt.sign({ account_id }, { expiresIn: "15m" });
  const expire_at = new Date(new Date().getTime() + 15 * 60000);
  const refresh_token = fastify.jwt.refresh.sign({ account_id }, { expiresIn: "7d" });

  db.transaction(() => {
    db.prepare("INSERT INTO refresh_tokens (account_id, token, expire_at) VALUES (?, ?, datetime('now', '+7 days'))")
      .run(account_id, refresh_token);

    db.prepare(`
      DELETE FROM refresh_tokens
      WHERE (SELECT COUNT(*) FROM refresh_tokens WHERE account_id = @id) > 5
        AND account_id = @id
        AND expire_at = (SELECT MIN(expire_at) FROM refresh_tokens WHERE account_id = @id)
    `).run({ id: account_id });
  })();
  return { access_token, expire_at, refresh_token };
}
