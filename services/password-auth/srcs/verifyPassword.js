'use strict';

import crypto from "crypto";

const pepper = process.env.PASSWORD_PEPPER
if (!pepper) {
  console.error("Missing environment variable: PASSWORD_PEPPER");
  process.exit(1);
}

export default async function verifyPassword(password, hash, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password + pepper, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(hash === derivedKey.toString("hex"));
    });
  });
}
