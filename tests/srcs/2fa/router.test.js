import request from "supertest";
import { app, createUsers, users } from "../../dummy/dummy-account.js";
import { apiURL, twofaURL } from "../../URLs.js";
import { TOTP } from "totp-generator";

createUsers(4);

describe("2FA Router", () => {
  describe("GET /app/activate", () => {
    let secret1;
    let secret2;

    it("not authorized", async () => {
      const response = await request(apiURL)
        .get("/2fa/app/activate")

      expect(response.statusCode).toBe(401);
    })

    it("activate", async () => {
      const response = await request(apiURL)
        .get("/2fa/app/activate")
        .set('Authorization', `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toBe(200);
      expect(response.body.otpauth).toMatch(/^otpauth:\/\/totp\/?/);
      expect(response.body.otpauth).toContain('issuer=YATT');
      expect(response.body.otpauth).toContain('algorithm=SHA1');
      expect(response.body.otpauth).toContain('digits=6');
      expect(response.body.otpauth).toContain('period=30');

      const secret = response.body.otpauth.match(/secret=([A-Z0-9]+)/)[1];
      expect(secret).toMatch(/^[A-Z2-7]+$/);
      expect(secret.length % 8).toBe(0);

      const queryString = response.body.otpauth.split('?')[1];
      const params = new URLSearchParams(queryString);
      secret1 = params.get('secret');
    })

    it("exists but inactive", async () => {
      const response = await request(apiURL)
        .get("/2fa/app/activate")
        .set('Authorization', `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toBe(200);

      expect(response.statusCode).toBe(200);
      expect(response.body.otpauth).toMatch(/^otpauth:\/\/totp\/?/);
      expect(response.body.otpauth).toContain('issuer=YATT');
      expect(response.body.otpauth).toContain('algorithm=SHA1');
      expect(response.body.otpauth).toContain('digits=6');
      expect(response.body.otpauth).toContain('period=30');

      const secret = response.body.otpauth.match(/secret=([A-Z0-9]+)/)[1];
      expect(secret).toMatch(/^[A-Z2-7]+$/);
      expect(secret.length % 8).toBe(0);

      const queryString = response.body.otpauth.split('?')[1];
      const params = new URLSearchParams(queryString);
      secret2 = params.get('secret');
    })

    it("already active", async () => {
      const activate = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({ otp: TOTP.generate(secret2).otp });

      expect(activate.statusCode).toBe(204);

      const response = await request(apiURL)
        .get("/2fa/app/activate")
        .set('Authorization', `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toBe(409);
    })

  }); // GET /app/activate

  describe("POST /app/activate/verify", () => {
    it("no body", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/activate/verify")

      expect(response.statusCode).toBe(400);
    })

    it("empty object", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/activate/verify")

      expect(response.statusCode).toBe(400);
    })

    it("otp not a string", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .send({ otp: {} });

      expect(response.statusCode).toBe(400);
    })

    it("otp too short", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .send({ otp: "12345" });

      expect(response.statusCode).toBe(400);
    })

    it("otp too long", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .send({ otp: "1234567" });

      expect(response.statusCode).toBe(400);
    })

    it("non numerical", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .send({ otp: "a23456" });

      expect(response.statusCode).toBe(400);
    })

    it("not authorized", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .send({ otp: "123456" })

      expect(response.statusCode).toBe(401);
    })

    it("nothing to validate", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .set('Authorization', `Bearer ${users[1].jwt}`)
        .send({ otp: "123456" })

      expect(response.statusCode).toBe(403);
    })

    it("validate", async () => {
      {
        const me = await request(apiURL)
          .get('/me')
          .set('Authorization', `Bearer ${users[1].jwt}`)

        expect(me.statusCode).toBe(200);
        expect(me.body.credentials.second_factor).toBe("none");
      }

      const activate = await request(apiURL)
        .get("/2fa/app/activate")
        .set('Authorization', `Bearer ${users[1].jwt}`)

      expect(activate.statusCode).toBe(200);

      expect(activate.body.otpauth).toMatch(/^otpauth:\/\/totp\/?/);
      expect(activate.body.otpauth).toContain('issuer=YATT');
      expect(activate.body.otpauth).toContain('algorithm=SHA1');
      expect(activate.body.otpauth).toContain('digits=6');
      expect(activate.body.otpauth).toContain('period=30');

      const secret = activate.body.otpauth.match(/secret=([A-Z0-9]+)/)[1];
      expect(secret).toMatch(/^[A-Z2-7]+$/);
      expect(secret.length % 8).toBe(0);

      const queryString = activate.body.otpauth.split('?')[1];
      const params = new URLSearchParams(queryString);
      users[1].otpsecret = params.get('secret');

      const validate = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .set('Authorization', `Bearer ${users[1].jwt}`)
        .send({ otp: TOTP.generate(users[1].otpsecret).otp })

      expect(validate.statusCode).toBe(204);

      {
        const me = await request(apiURL)
          .get('/me')
          .set('Authorization', `Bearer ${users[1].jwt}`)

        expect(me.statusCode).toBe(200);
        expect(me.body.credentials.second_factor).toBe("app");
      }
    })

    it("already using old secret", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .set('Authorization', `Bearer ${users[1].jwt}`)
        .send({ otp: TOTP.generate(users[1].otpsecret).otp })

      expect(response.statusCode).toBe(403);
    })

    it("already validated", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .set('Authorization', `Bearer ${users[1].jwt}`)
        .send({ otp: TOTP.generate(users[1].otpsecret).otp })

      expect(response.statusCode).toBe(403);
    })
  }); // POST /app/activate/verify

  describe("POST /app/deactivate", () => {
    it("no body", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/deactivate")

      expect(response.statusCode).toBe(400);
    })

    it("empty object", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/deactivate")

      expect(response.statusCode).toBe(400);
    })

    it("otp not a string", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/deactivate")
        .send({ otp: {} });

      expect(response.statusCode).toBe(400);
    })

    it("otp too short", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/deactivate")
        .send({ otp: "12345" });

      expect(response.statusCode).toBe(400);
    })

    it("otp too long", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/deactivate")
        .send({ otp: "1234567" });

      expect(response.statusCode).toBe(400);
    })

    it("non numerical", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/deactivate")
        .send({ otp: "a23456" });

      expect(response.statusCode).toBe(400);
    })

    it("not authorized", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/deactivate")
        .send({ otp: "123456" })

      expect(response.statusCode).toBe(401);
    })

    it("bad opt", async () => {
      const response = await request(apiURL)
        .post("/2fa/app/deactivate")
        .set('Authorization', `Bearer ${users[1].jwt}`)
        .send({ otp: "123456" })

      expect(response.statusCode).toBe(403);
    })

    it("deactivate", async () => {
      const activate = await request(apiURL)
        .get("/2fa/app/activate")
        .set('Authorization', `Bearer ${users[3].jwt}`)

      expect(activate.statusCode).toBe(200);

      expect(activate.body.otpauth).toMatch(/^otpauth:\/\/totp\/?/);
      expect(activate.body.otpauth).toContain('issuer=YATT');
      expect(activate.body.otpauth).toContain('algorithm=SHA1');
      expect(activate.body.otpauth).toContain('digits=6');
      expect(activate.body.otpauth).toContain('period=30');

      const secret = activate.body.otpauth.match(/secret=([A-Z0-9]+)/)[1];
      expect(secret).toMatch(/^[A-Z2-7]+$/);
      expect(secret.length % 8).toBe(0);

      const queryString = activate.body.otpauth.split('?')[1];
      const params = new URLSearchParams(queryString);
      users[3].otpsecret = params.get('secret');

      const validate = await request(apiURL)
        .post("/2fa/app/activate/verify")
        .set('Authorization', `Bearer ${users[3].jwt}`)
        .send({ otp: TOTP.generate(users[3].otpsecret).otp })

      expect(validate.statusCode).toBe(204);

      {
        const me = await request(apiURL)
          .get('/me')
          .set('Authorization', `Bearer ${users[3].jwt}`)

        expect(me.statusCode).toBe(200);
        expect(me.body.credentials.second_factor).toBe("app");
      }

      const response = await request(apiURL)
        .post("/2fa/app/deactivate")
        .set('Authorization', `Bearer ${users[3].jwt}`)
        .send({ otp: TOTP.generate(users[3].otpsecret).otp })

      expect(response.statusCode).toBe(204);

      {
        const me = await request(apiURL)
          .get('/me')
          .set('Authorization', `Bearer ${users[3].jwt}`)

        expect(me.statusCode).toBe(200);
        expect(me.body.credentials.second_factor).toBe("none");
      }
    });
  }); // POST /app/activate

  describe("POST /app/verify", () => {
    it("no auth", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")

      expect(response.statusCode).toBe(401);
    })

    it("auth using user jwt", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${users[3].jwt}`)

      expect(response.statusCode).toBe(401);
    })

    it("auth using other service jwt", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.sign({})}`);

      expect(response.statusCode).toBe(401);
    })

    it("no body", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body must be object");
    })

    it("no account_id", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body must have required property 'account_id'");
    })

    it("no otp", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: {} });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body must have required property 'otp'");
    })

    it("account_id not interger", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: {}, otp: {} });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body/account_id must be integer");
    })

    it("otp not string", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: 42, otp: {} });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body/otp must be string");
    })

    it("otp too short", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: 42, otp: "short" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body/otp must NOT have fewer than 6 characters");
    })

    it("otp too long", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: 42, otp: "WAYTOLOOOOONG" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body/otp must NOT have more than 6 characters");
    })

    it("otp too long", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: 42, otp: "WAYTOLOOOOONG" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body/otp must NOT have more than 6 characters");
    })

    it("otp bad pattern", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: 42, otp: "thisok" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body/otp must match pattern \"^[0-9]{6}$\"");
    })

    it("not activated", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: users[3].account_id, otp: "123456" });

      expect(response.statusCode).toBe(403);
    })

    it("activated + bad otp", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: users[1].account_id, otp: "456264" });

      expect(response.statusCode).toBe(403);
    })

    it("activated + bad otp", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: users[1].account_id, otp: TOTP.generate(users[3].otpsecret).otp });

      expect(response.statusCode).toBe(403);
    })

    it("success", async () => {
      const response = await request(twofaURL)
        .post("/app/verify")
        .set('Authorization', `Bearer ${app.jwt.two_fa.sign({})}`)
        .send({ account_id: users[1].account_id, otp: TOTP.generate(users[1].otpsecret).otp });

      expect(response.statusCode).toBe(204);
    })
  }); // POST /app/verify

}); // 2FA Router
