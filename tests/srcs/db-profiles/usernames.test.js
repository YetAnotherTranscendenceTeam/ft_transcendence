import request from "supertest";
import crypto from "crypto";

const profilesURL = "http://127.0.0.1:7001"

describe("/usernames/:username", () => {
  const dummyProfile = {
    account_id: parseInt(Math.random() * 10000000 + 1000000),
    username: `jest-${crypto.randomBytes(5).toString("hex")}`,
  };

  it("create dummy profile", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: dummyProfile.account_id,
      })
      .expect(201)
      .expect("Content-Type", /json/);
  })

  it("get by username not existing yet", async () => {
    const response = await request(profilesURL)
      .get(`/?filter[username]=${dummyProfile.username}`)
      .expect(200)
      .expect("Content-Type", /json/);

      expect(response.body).toEqual([])
  })

  it("patch profile username", async () => {
    const response = await request(profilesURL)
      .patch(`/${dummyProfile.account_id}`)
      .send({
        username: dummyProfile.username,
      })
      .expect(200)
      .expect("Content-Type", /json/);
    // console.error(response.body)
    expect(response.body.account_id).toEqual(dummyProfile.account_id);
    expect(response.body.username).toEqual(dummyProfile.username);
    expect(response.body.avatar).toEqual(expect.any(String));
  })

  it("get by username", async () => {
    const response = await request(profilesURL)
      .get(`/?filter[username]=${dummyProfile.username}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body.length).toEqual(1);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          account_id: dummyProfile.account_id,
          username: dummyProfile.username,
          avatar: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String)
        })
      ])
    );
  })

  it("patch profile username", async () => {
    const response = await request(profilesURL)
      .patch(`/${dummyProfile.account_id}`)
      .send({
        username: dummyProfile.username.slice(5),
      })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body.account_id).toEqual(dummyProfile.account_id);
    expect(response.body.username).toEqual(dummyProfile.username.slice(5));
    expect(response.body.avatar).toEqual(expect.any(String));
  })

  it("get by old username", async () => {
    const response = await request(profilesURL)
      .get(`/?filter[username]=${dummyProfile.username}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual([])
  })

  it("get by username", async () => {
    const response = await request(profilesURL)
      .get(`/?filter[username]=${dummyProfile.username.slice(5)}`)
      .expect(200)
      .expect("Content-Type", /json/);

      expect(response.body.length).toEqual(1);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            account_id: dummyProfile.account_id,
            username: dummyProfile.username.slice(5),
            avatar: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String)
          })
        ])
      );
  })

  it("delete dummy profile", async () => {
    const response = await request(profilesURL)
      .delete(`/${dummyProfile.account_id}`)
      .expect(204)
  })
});

