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
      .query({ filter: { "username:match": testUsername } })
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
      .query({ filter: { "username:match": testUsername } })
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

  it('specific username', async () => {
    const user = users[5];
    const response = await request(profilesURL)
      .get('/')
      .query({ filter: { username: user.username } })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body).toEqual([
      expect.objectContaining({
        account_id: user.account_id,
        username: user.username,
        avatar: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    ]);
  });

  it('multiple usernames', async () => {
    const indexes = [5, 12, 2];
    const response = await request(profilesURL)
      .get('/')
      .query({ filter: { username: indexes.map(i => users[i].username).join(",") } })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body).toEqual(
      expect.arrayContaining(
        indexes.map(i => {
          return expect.objectContaining({
            account_id: users[i].account_id,
            username: users[i].username,
            avatar: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
          })
        })
      )
    )
  });

  it('filter by account_id', async () => {
    const user = users[18];
    const response = await request(profilesURL)
      .get('/')
      .query({ filter: { account_id: user.account_id } })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body).toEqual([
      expect.objectContaining({
        account_id: user.account_id,
        username: user.username,
        avatar: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    ]);
  });

  it('filter by multiple account_id', async () => {
    const indexes = [5, 12, 2];
    const response = await request(profilesURL)
      .get('/')
      .query({ filter: { account_id: indexes.map(i => users[i].account_id).join(",") } })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body).toEqual(
      expect.arrayContaining(
        indexes.map(i => {
          return expect.objectContaining({
            account_id: users[i].account_id,
            username: users[i].username,
            avatar: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
          })
        })
      )
    )
  });

  it('filter by account_id:not', async () => {
    const user = users[18];
    const response = await request(profilesURL)
      .get('/')
      .query({ limit: 100, filter: { "account_id:not": user.account_id } })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body).not.toEqual([
      expect.objectContaining({
        account_id: user.account_id,
        username: user.username,
        avatar: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    ]);
  });

  it('filter by multiple account_id:not', async () => {
    const response = await request(profilesURL)
      .get('/')
      .query({ filter: { account_id: users.map(u => u.account_id).join(",") } })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body).not.toEqual(
      expect.arrayContaining(
        users.map(u => {
          return expect.objectContaining({
            account_id: u.account_id,
            username: u.username,
            avatar: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
          })
        })
      )
    )
  });

  it('filter by account_id:not', async () => {
    const user = users[18];
    const response = await request(profilesURL)
      .get('/')
      .query({ limit: 100, filter: { "account_id:not": user.account_id } })
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body).not.toEqual([
      expect.objectContaining({
        account_id: user.account_id,
        username: user.username,
        avatar: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    ]);
  });

});
