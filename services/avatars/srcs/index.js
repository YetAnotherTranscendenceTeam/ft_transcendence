"use strict";

import build from "./app/builder.js";
import db from "./app/database.js";
import { cdn_url } from "./app/env.js";

const server = build({
  bodyLimit: 5 * 1024 * 1024 // 5 MB
});

server.listen({ port: 3000, host: "0.0.0.0" }, async (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  // Load default avatars into the database
  await defaultAvatars(`${cdn_url}/api/avatars/default`);
});

const defaultAvatars = async (host) => {
  const access_token = server.jwt.cdn.sign({}, { expireIn: '15m' });
  let attempt = 0;

  while (attempt < 5) {
    try {
      const response = await fetch(host, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Remove current default avatars
        db.exec("DELETE FROM avatars WHERE account_id = -1");

        // Refill database with up to date default avatars
        const insert = db.prepare("INSERT INTO avatars (account_id, url) VALUES (-1, ?)");
        console.log("Loading default avatars...");
        for (const avatar of data) {
          insert.run(cdn_url + avatar)
          console.log(`\t ${cdn_url + avatar}`);
        }
        break;
      }
    } catch (err) {
      attempt++;
      console.error(err);
      console.error("")
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
};
