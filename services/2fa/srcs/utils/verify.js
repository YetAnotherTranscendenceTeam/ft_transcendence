
import { createHmac } from "node:crypto";
import { base32 } from "rfc4648";

export function generateTOTP(secret, options = {}) {
  const { algorithm = "SHA-1", digits = 6, period = 30 } = options;
  let counter = Math.floor(Date.now() / (period * 1000));

  const buffer = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    buffer[i] = counter & 0xff;
    counter >>= 8;
  }

  const hmac = createHmac(algorithm, base32.parse(secret)).update(buffer).digest();

  const offset = hmac[hmac.length - 1] & 0xf;

  const binary = ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 10 ** digits).toString().padStart(digits, "0");
}
