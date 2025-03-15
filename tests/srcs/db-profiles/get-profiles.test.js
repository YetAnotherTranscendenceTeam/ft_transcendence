import request from "supertest";
import { createUsers, users } from "../../dummy/dummy-account";

createUsers(50);

describe('GET / route', () => {
  const profilesURL = "http://127.0.0.1:7001"

  it('should return profiles with default limit and offset', async () => {
    const response = await request(profilesURL)
      .get('/')
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBe(30);
  });

  it('should respect custom limit and offset', async () => {
    const response = await request(profilesURL)
      .get('/')
      .query({ limit: 15, offset: 10 })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBe(15);
  });

  it('should filter profiles by username', async () => {
    const testUsername = 'e';
    const response = await request(profilesURL)
      .get('/')
      .query({ filter: { username: testUsername } })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    response.body.forEach(profile => {
      expect(profile.username.toLowerCase()).toContain(testUsername.toLowerCase());
    });
  });

  it('should filter profiles by username', async () => {
    const testUsername = 'ee';
    const response = await request(profilesURL)
      .get('/')
      .query({ filter: { username: testUsername } })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    response.body.forEach(profile => {
      expect(profile.username.toLowerCase()).toContain(testUsername.toLowerCase());
    });
  });

  it('should return empty array for non-existent username', async () => {
    const response = await request(profilesURL)
      .get('/')
      .query({ filter: { username: 'nonexistentuser' } })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBe(0);
  });
});
