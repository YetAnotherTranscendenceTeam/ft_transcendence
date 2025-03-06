import request from "supertest";
import { dummy } from "../../dummy/one-dummy";
import { dummy2 } from "../../dummy/another-dummy";

const baseUrl = 'https://127.0.0.1:7979';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Settings Router', () => {
  let availableAvatars;

  beforeAll(async () => {
    const availableAvatarsResponse = await request(baseUrl)
      .get('/avatars')
      .set('Authorization', `Bearer ${dummy.jwt}`)
      .expect(200);

    availableAvatars = availableAvatarsResponse.body.default.concat(availableAvatarsResponse.body.user);
  });

  function getRandomAvatar() {
    const randomIndex = Math.floor(Math.random() * availableAvatars.length);
    return availableAvatars[randomIndex];
  }

  describe('PATCH /settings/profile', () => {
    it("no body", async () => {
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .expect(400);
    });

    it("patchin same username", async () => {
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .send({ username: dummy.username })
        .expect(204);

      const response = await request(baseUrl)
        .get("/me")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .expect(200);

      expect(response.body.username).toBe(dummy.username);
    });

    it("update username only", async () => {
      const newUsername = "newUsername";
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .send({ username: newUsername })
        .expect(204);

      const response = await request(baseUrl)
        .get("/me")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .expect(200);

      expect(response.body.username).toBe(newUsername);
    });

    it("update avatar only", async () => {
      const newAvatar = getRandomAvatar();
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .send({ avatar: newAvatar })
        .expect(204);

      const response = await request(baseUrl)
        .get("/me")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .expect(200);

      expect(response.body.avatar).toBe(newAvatar);
    });

    it("update both username and avatar", async () => {
      const newAvatar = getRandomAvatar();
      const newUsername = "newUsername2";
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .send({ username: newUsername, avatar: newAvatar })
        .expect(204);

      const response = await request(baseUrl)
        .get("/me")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .expect(200);

      expect(response.body.username).toBe(newUsername);
      expect(response.body.avatar).toBe(newAvatar);
    });

    it("send additional properties", async () => {
      const newUsername = "newUsername3";
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .send({ username: newUsername, extraField: "shouldNotBeAllowed" })
        .expect(204);

        const response = await request(baseUrl)
        .get("/me")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .expect(200);

      expect(response.body.username).toBe(newUsername);
    });

    it("send empty object", async () => {
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .send({})
        .expect(400);
    });

    it("send invalid username (too long)", async () => {
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .send({ username: "inv@lidinv@lidinv@lid" })
        .expect(400);
    });

    it("send invalid username (too short)", async () => {
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .send({ username: "12" })
        .expect(400);
    });

    it("send conflicting username", async () => {
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .send({ username: dummy2.username })
        .expect(409);
    });

    it("send unavailable avatar", async () => {
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .send({ avatar: "https://tricky-little-ferret.com/some-pic.png" })
        .expect(403);
    });

    it("send request without authorization", async () => {
      await request(baseUrl)
        .patch("/settings/profile")
        .send({ username: "newUsername" })
        .expect(401);
    });

    it("send request with invalid token", async () => {
      await request(baseUrl)
        .patch("/settings/profile")
        .set('Authorization', 'Bearer invalidToken')
        .send({ username: "newUsername" })
        .expect(401);
    });
  });
});