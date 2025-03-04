import request from "supertest";
import { dummy } from "../../dummy/one-dummy";
import { avatarPNG } from "./b64avatars.js";

const baseUrl = 'https://127.0.0.1:7979'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Avatar Creation and Deletion', () => {
  const createdAvatars = [];

  it('should create 5 avatars and then delete them', async () => {
    // Create 5 avatars
    for (let i = 0; i < 5; i++) {
      const response = await request(baseUrl)
        .post('/avatars')
        .set("Authorization", `Bearer ${dummy.jwt}`)
        .set('Content-Type', 'text/plain')
        .send(avatarPNG);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('url');
      createdAvatars.push(response.body.url);
    }

    // Verify 5 avatars were created
    expect(createdAvatars.length).toBe(5);
    for (let url of createdAvatars) {
        url = new URL(url); 
        await request('https://' + url.host).get(url.pathname).expect(200);
    }

    // Delete each avatar
    for (const url of createdAvatars) {
      const deleteResponse = await request(baseUrl)
        .delete(`/avatars?url=${encodeURIComponent(url)}`)
        .set("Authorization", `Bearer ${dummy.jwt}`);

      expect(deleteResponse.status).toBe(204);
    }

    // Verify all avatars are deleted
    const finalResponse = await request(baseUrl)
      .get("/avatars")
      .set('Authorization', `Bearer ${dummy.jwt}`);

    expect(finalResponse.status).toBe(200);
    expect(finalResponse.body.user.length).toBe(0);

    for (let url of createdAvatars) {
        url = new URL(url); 
        await request('https://' + url.host).get(url.pathname).expect(404);
    }
  });
});
