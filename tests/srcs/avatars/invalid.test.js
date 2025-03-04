import request from "supertest";
import { dummy } from "../../dummy/one-dummy";
import { noMime, corrupted } from "./b64avatars.js";

const baseUrl = 'https://127.0.0.1:7979'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Avatar Router', () => {
  describe('POST /', () => {
    it('no mimes', async () => {
      const response = await request(baseUrl)
        .post('/avatars')
        .set("Authorization", `Bearer ${dummy.jwt}`)
        .set('Content-Type', 'text/plain')
        .send(noMime)

      expect(response.status).toBe(400);
    });
  
    it('corrupted', async () => {
      const response = await request(baseUrl)
        .post('/avatars')
        .set("Authorization", `Bearer ${dummy.jwt}`)
        .set('Content-Type', 'text/plain')
        .send(corrupted)

      expect(response.status).toBe(400);
    });

    it("verify user has no avatars", async () => {
      const response = await request(baseUrl)
        .get("/avatars")
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .expect(200);

      // Check if the response body has the correct structure
      expect(response.body).toHaveProperty('default');
      expect(response.body).toHaveProperty('user');

      // Check if 'default' is an array with at least one item
      expect(Array.isArray(response.body.default)).toBe(true);
      expect(response.body.default.length).toBeGreaterThan(0);

      // Check if 'user' in an array of size one
      expect(Array.isArray(response.body.user)).toBe(true);
      expect(response.body.user.length).toBe(0);
    });
  });
});
