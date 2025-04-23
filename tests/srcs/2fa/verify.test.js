import { generateTOTP } from "../../../services/2fa/srcs/utils/verifyTOTP.js";
import crypto from "crypto";
import { TOTP } from "totp-generator";
import { base32 } from "rfc4648";

describe("2FA Router", () => {
  it("default + fixed secret", () => {
    const secret = "ZVBNXR74UM56DIY3H76BSJ4NDUOAKESN";

    const lib = TOTP.generate(secret);
    const yatt = generateTOTP(secret)

    expect(yatt).toBe(lib.otp.padStart(6, "0"));
  })

  const N = 15;

  describe("default, 6 digits SHA-1", () => {
    for (let i = 0; i < N; ++i) {
      it("random seed", () => {
        const secret = base32.stringify(crypto.randomBytes(20));

        const lib = TOTP.generate(secret);
        const yatt = generateTOTP(secret)

        expect(yatt).toBe(lib.otp.padStart(6, "0"));
      })
    }
  })

  describe("8 digits SHA-1", () => {
    for (let i = 0; i < N; ++i) {
      it("random seed", () => {
        const secret = base32.stringify(crypto.randomBytes(20));

        const lib = TOTP.generate(secret, { digits: 8 });
        const yatt = generateTOTP(secret, { digits: 8 })

        expect(yatt).toBe(lib.otp.padStart(8, "0"));
      })
    }
  })

  describe("sha256", () => {
    for (let i = 0; i < N; ++i) {
      it("random seed", () => {
        const secret = base32.stringify(crypto.randomBytes(20));

        const lib = TOTP.generate(secret, { algorithm: "SHA-256" });
        const yatt = generateTOTP(secret, { algorithm: "SHA-256" })

        expect(yatt).toBe(lib.otp.padStart(6, "0"));
      })
    }
  })

  describe("60 period", () => {
    for (let i = 0; i < N; ++i) {
      it("random seed", () => {
        const secret = base32.stringify(crypto.randomBytes(20));

        const lib = TOTP.generate(secret, { period: 60 });
        const yatt = generateTOTP(secret, { period: 60 })

        expect(yatt).toBe(lib.otp.padStart(6, "0"));
      })
    }
  })
});
