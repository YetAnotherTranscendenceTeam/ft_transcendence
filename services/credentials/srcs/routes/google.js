'use strict';

// import db from "../database.js";

// export default function router(fastify, opts, done) {

//   // Get google_auth table entries
//   fastify.get("/", async function handler(request, reply) {
//     const { limit = 30, offset = 0 } = request.query;

//     // Cap limit to 100
//     const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 10), 100);
//     // Prevent negative offset 
//     const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

//     return db.prepare(`SELECT * FROM google_auth LIMIT ? OFFSET ?`).all(safeLimit, safeOffset);
//   });

//   // Get the account associated to a google_id
//   fastify.get("/:google_id", async function handler(request, reply) {
//     const { google_id } = request.params;

//     const account = db.prepare(`
//       SELECT accounts.id, accounts.email, google_auth.*
//       FROM accounts
//       INNER JOIN google_auth
//         ON accounts.id = google_auth.id
//       WHERE auth_method = 'google_auth'
//         AND google_auth.google_id = ?;
//     `).get(google_id);

//     if (!account) {
//       reply.status(404).send({ error: "Account not found" });
//     }
//     return account;
//   });

//   // Create an email/password based account
//   fastify.post("/", async function handler(request, reply) {
//     const { email, google_id } = request.body;

//     return db.transaction(() => {
//       const accountId = db.prepare(`
//         INSERT INTO accounts (email, auth_method)
//         VALUES (?, 'google_auth')
//         RETURNING id
//       `).get(email);
    
//       return db.prepare(`
//         INSERT INTO google_auth (id, google_id)
//         VALUES (?, ?)
//         RETURNING *
//       `).get(accountId.id, google_id);
//     })();
//   });

//   done();
// }
