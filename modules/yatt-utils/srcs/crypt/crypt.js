import crypto from "crypto";

/**
 * Salt generation
 * @returns {string} A random salt
 */
function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Password hashing
 * @param {string} password - The password to hash
 * @returns {{hash: string, salt: string}} The resuling hash and it's associated salt
 */
export async function hashPassword(password, pepper) {
  const salt = generateSalt();
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password + pepper, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });

  return {
    hash: derivedKey.toString("hex"),
    salt: salt,
  };
}

/**
 * Compare a password to a hash+salt pair
 * @param {string} password - The password
 * @param {string} hash - The hash to compare
 * @param {string} salt - The salt used to generate the hash
 * @returns {bool} True if the password match the hash, false if it does not
 */
export async function verifyPassword(password, hash, salt, pepper) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password + pepper, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(hash === derivedKey.toString("hex"));
    });
  });
}