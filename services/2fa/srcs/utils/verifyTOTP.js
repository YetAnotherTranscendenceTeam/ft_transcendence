"use strict";

import { createHmac } from "node:crypto";
import { base32 } from "rfc4648";

export function verifyTOTP(totp, secret) {
  return totp === generateTOTP(secret) || totp === generateTOTP(secret, { timestamp: Date.now() - 30000 });
}

export function generateTOTP(secret, options = {}) {
  const {
    algorithm = "SHA1", 
    digits = 6, 
    period = 30,
    timestamp = Date.now(),
  } = options;

  // Get counter based on current UNIX time
  const counter = Buffer.alloc(8);
  counter.writeBigUint64BE(BigInt(Math.floor(timestamp / (period * 1000))));

  // Hash counter using shared secret
  const hmac = createHmac(algorithm, base32.parse(secret)).update(counter).digest();

  // Truncate hash according to rfc6238 
  const offset = hmac[hmac.length - 1] & 0xf;

  const binary = ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 10 ** digits).toString().padStart(digits, "0");
}
