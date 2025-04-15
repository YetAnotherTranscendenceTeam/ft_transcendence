import request from "supertest";
import { createUsers, users } from "../../dummy/dummy-account";
import { apiURL } from "../../URLs";

createUsers(2);

describe('Settings Router', () => {
  let availableAvatars;

  beforeAll(async () => {
    const availableAvatarsResponse = await request(apiURL)
      .get('/avatars')
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(200);

    availableAvatars = availableAvatarsResponse.body.default.concat(availableAvatarsResponse.body.user);
  });

  function getRandomAvatar() {
    const randomIndex = Math.floor(Math.random() * availableAvatars.length);
    return availableAvatars[randomIndex];
  }

  describe('PATCH /settings/profile', () => {
    it("no body", async () => {
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(400);
    });

    it("patchin same username", async () => {
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({ username: users[0].username })
        .expect(204);

      const response = await request(apiURL)
        .get("/me")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(200);

      expect(response.body.username).toBe(users[0].username);
    });

    it("update username only", async () => {
      const newUsername = "newUsername";
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({ username: newUsername })
        .expect(204);

      const response = await request(apiURL)
        .get("/me")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(200);

      expect(response.body.username).toBe(newUsername);
    });

    it("update avatar only", async () => {
      const newAvatar = getRandomAvatar();
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({ avatar: newAvatar })
        .expect(204);

      const response = await request(apiURL)
        .get("/me")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(200);

      expect(response.body.avatar).toBe(newAvatar);
    });

    it("update both username and avatar", async () => {
      const newAvatar = getRandomAvatar();
      const newUsername = "newUsername2";
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({ username: newUsername, avatar: newAvatar })
        .expect(204);

      const response = await request(apiURL)
        .get("/me")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(200);

      expect(response.body.username).toBe(newUsername);
      expect(response.body.avatar).toBe(newAvatar);
    });

    it("send additional properties", async () => {
      const newUsername = "newUsername3";
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({ username: newUsername, extraField: "shouldNotBeAllowed" })
        .expect(400);

        const response = await request(apiURL)
        .get("/me")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(200);

      expect(response.body.username).toBe("newUsername2");
    });

    it("send empty object", async () => {
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({})
        .expect(400);
    });

    it("send invalid username (too long)", async () => {
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({ username: "inv@lidinv@lidinv@lid" })
        .expect(400);
    });

    it("send invalid username (too short)", async () => {
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({ username: "12" })
        .expect(400);
    });

    it("send conflicting username", async () => {
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({ username: users[1].username })
        .expect(409);
    });

    it("send unavailable avatar", async () => {
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .send({ avatar: "https://tricky-little-ferret.com/some-pic.png" })
        .expect(403);
    });

    it("send request without authorization", async () => {
      await request(apiURL)
        .patch("/settings/profile")
        .send({ username: "newUsername" })
        .expect(401);
    });

    it("send request with invalid token", async () => {
      await request(apiURL)
        .patch("/settings/profile")
        .set('Authorization', 'Bearer invalidToken')
        .send({ username: "newUsername" })
        .expect(401);
    });
  });
});
