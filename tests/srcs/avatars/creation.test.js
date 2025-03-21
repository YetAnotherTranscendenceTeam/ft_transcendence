import request from "supertest";
import { avatarPNG } from "./b64avatars.js";
import { apiURL } from "../../URLs.js";
import { createUsers, users } from "../../dummy/dummy-account.js";

createUsers(1);

describe('Avatar Router', () => {
  describe('GET /', () => {
    it("get new account avatars", async () => {
      const response = await request(apiURL)
        .get("/avatars")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(200);

      // Check if the response body has the correct structure
      expect(response.body).toHaveProperty('default');
      expect(response.body).toHaveProperty('user');

      // Check if 'default' is an array with at least one item
      expect(Array.isArray(response.body.default)).toBe(true);
      expect(response.body.default.length).toBeGreaterThan(0);

      // Check if 'user' is an empty array
      expect(Array.isArray(response.body.user)).toBe(true);
      expect(response.body.user.length).toBe(0);
    });
  });

  describe('POST /', () => {
    it('should create a new avatar', async () => {
      const response = await request(apiURL)
        .post('/avatars')
        .set("Authorization", `Bearer ${users[0].jwt}`)
        .set('Content-Type', 'text/plain')
        .send(avatarPNG);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('url');
    });

    it("verify avatar has been added", async () => {
      const response = await request(apiURL)
        .get("/avatars")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(200);

      // Check if the response body has the correct structure
      expect(response.body).toHaveProperty('default');
      expect(response.body).toHaveProperty('user');

      // Check if 'default' is an array with at least one item
      expect(Array.isArray(response.body.default)).toBe(true);
      expect(response.body.default.length).toBeGreaterThan(0);

      // Check if 'user' in an array of size one
      expect(Array.isArray(response.body.user)).toBe(true);
      expect(response.body.user.length).toBe(1);
    });

    for (let i = 0; i < 4; ++i) {
      it('fill avatar slots', async () => {
        const response = await request(apiURL)
          .post('/avatars')
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .set('Content-Type', 'text/plain')
          .send(avatarPNG);
  
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('url');
      });
    }

    it('should reject when avatar limit is reached', async () => {
      const response = await request(apiURL)
        .post('/avatars')
        .set("Authorization", `Bearer ${users[0].jwt}`)
        .set('account_id', '123')
        .set('Content-Type', 'text/plain')
        .send(avatarPNG);

      expect(response.status).toBe(403);
    });
  
    it("verify user has 5 avatars", async () => {
      const response = await request(apiURL)
        .get("/avatars")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(200);

      // Check if the response body has the correct structure
      expect(response.body).toHaveProperty('default');
      expect(response.body).toHaveProperty('user');

      // Check if 'default' is an array with at least one item
      expect(Array.isArray(response.body.default)).toBe(true);
      expect(response.body.default.length).toBeGreaterThan(0);

      // Check if 'user' in an array of size one
      expect(Array.isArray(response.body.user)).toBe(true);
      expect(response.body.user.length).toBe(5);
    });
  });
});
