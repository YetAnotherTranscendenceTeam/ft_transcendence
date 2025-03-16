import request from "supertest";
import crypto from "crypto";

const profilesURL = "http://127.0.0.1:7001"

describe("/usernames/:username", () => {
  const dummyProfile = {
    account_id: parseInt(Math.random() * 10000000 + 1000000)
  };

  it("create dummy profile", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: dummyProfile.account_id,
        username: dummyProfile.username,
      })
      .expect(201)
      .expect("Content-Type", /json/);
  })

  it("get by accounts_id", async () => {
    const response = await request(profilesURL)
      .get(`/${dummyProfile.account_id}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body.account_id).toEqual(dummyProfile.account_id);
    expect(response.body.username).toEqual(expect.any(String));
    expect(response.body.avatar).toEqual(expect.any(String));
  })

  it("delete dummy profile", async () => {
    const response = await request(profilesURL)
      .delete(`/${dummyProfile.account_id}`)
      .expect(204)
  })
});

