import request from "supertest";
import { avatarPNG } from "./b64avatars.js";
import { apiURL } from "../../URLs.js";
import { createUsers, users } from "../../dummy/dummy-account.js";

createUsers(1);

describe('Avatar Creation and Deletion', () => {
  const createdAvatars = [];

  it('should create 5 avatars and then delete them', async () => {
    // Create 5 avatars
    for (let i = 0; i < 5; i++) {
      const response = await request(apiURL)
        .post('/avatars')
        .set("Authorization", `Bearer ${users[0].jwt}`)
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
        await request("https://127.0.0.1:8181").get(url.pathname).expect(200);
    }

    // Delete each avatar
    for (const url of createdAvatars) {
      const deleteResponse = await request(apiURL)
        .delete(`/avatars?url=${encodeURIComponent(url)}`)
        .set("Authorization", `Bearer ${users[0].jwt}`);

      expect(deleteResponse.status).toBe(204);
    }

    // Verify all avatars are deleted
    const finalResponse = await request(apiURL)
      .get("/avatars")
      .set('Authorization', `Bearer ${users[0].jwt}`);

    expect(finalResponse.status).toBe(200);
    expect(finalResponse.body.user.length).toBe(0);

    for (let url of createdAvatars) {
        url = new URL(url); 
        await request("https://127.0.0.1:8181").get(url.pathname).expect(404);
    }
  });
});
