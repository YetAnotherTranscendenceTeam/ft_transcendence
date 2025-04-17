import { generateTOTP } from "../../../services/2fa/srcs/utils/verify";
import crypto from "crypto";
import { TOTP } from "totp-generator";
import { base32 } from "rfc4648";

describe("2FA Router", () => {
  it("default + fixed secret", () => {
    const secret = "ZVBNXR74UM56DIY3H76BSJ4NDUOAKESN";

    const lib = TOTP.generate(secret);
    const yatt = generateTOTP(secret)

    expect(lib.otp.padStart(6, 0)).toBe(yatt);
  })

  const N = 5;

  describe("default, 6 digits SHA-1", () => {
    for (let i = 0; i < N; i++) {
      it("random seed", () => {
        const secret = base32.stringify(crypto.randomBytes(20));

        const lib = TOTP.generate(secret);
        const yatt = generateTOTP(secret)

        expect(lib.otp).toBe(yatt);
      })
    }
  })

  describe("8 digits SHA-1", () => {
    for (let i = 0; i < N; i++) {
      it("random seed", () => {
        const secret = base32.stringify(crypto.randomBytes(20));

        const lib = TOTP.generate(secret, { digits: 8 });
        const yatt = generateTOTP(secret, { digits: 8 })

        expect(lib.otp).toBe(yatt);
      })
    }
  })

  describe("sha256", () => {
    for (let i = 0; i < N; i++) {
      it("random seed", () => {
        const secret = base32.stringify(crypto.randomBytes(20));

        const lib = TOTP.generate(secret, { algorithm: "SHA-256" });
        const yatt = generateTOTP(secret, { algorithm: "SHA-256" })

        expect(lib.otp).toBe(yatt);
      })
    }
  })

  describe("60 period", () => {
    for (let i = 0; i < N; i++) {
      it("random seed", () => {
        const secret = base32.stringify(crypto.randomBytes(20));

        const lib = TOTP.generate(secret, { period: 60 });
        const yatt = generateTOTP(secret, { period: 60 })

        expect(lib.otp).toBe(yatt);
      })
    }
  })
});
