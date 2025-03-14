import request from "supertest";
import crypto from "crypto";

const profilesURL = "http://127.0.0.1:7001"

describe("Profile creation routine", () => {
  it("no body", async () => {
    const response = await request(profilesURL)
      .post("/")
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: 'body must be object'
    })
  })

  it("empty body", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({})
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "body must have required property 'account_id'"
    })
  })

  it("bad account_id", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "body/account_id must be integer"
    })
  })

  it("bad account_id", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: "",
        username: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "body/account_id must be integer"
    })
  })

  const dummyProfile = {
    account_id: parseInt(Math.random() * 10000000 + 1000000),
    username: crypto.randomBytes(5).toString("hex"),
  };

  it("sucessfull profile creation", async () => {
    const response = await request(profilesURL)
      .post("/")
      .send({
        account_id: dummyProfile.account_id,
      })
      .expect(201)
      .expect("Content-Type", /json/);
  })

  it("get account created", async () => {
    const response = await request(profilesURL)
      .get(`/${dummyProfile.account_id}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body.account_id).toEqual(dummyProfile.account_id);
    expect(response.body.username).toEqual(expect.any(String));
    expect(response.body.avatar).toEqual(expect.any(String));
  })

  it("delete profile", async () => {
    const response = await request(profilesURL)
      .delete(`/${dummyProfile.account_id}`)
      .expect(204)
  })

  it("delete non existing profile", async () => {
    const response = await request(profilesURL)
      .delete(`/${dummyProfile.account_id}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 404,
      code: 'ACCOUNT_NOT_FOUND',
      error: 'Account Not Found',
      message: 'The requested account does not exist'
    });
  })

  it("get nonexisting", async () => {
    const response = await request(profilesURL)
      .get(`/${dummyProfile.account_id}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 404,
      code: 'ACCOUNT_NOT_FOUND',
      error: 'Account Not Found',
      message: 'The requested account does not exist'
    });
  })

  it("get by nonexisting username", async () => {
    const response = await request(profilesURL)
      .get(`/usernames/${dummyProfile.username}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 404,
      code: 'ACCOUNT_NOT_FOUND',
      error: 'Account Not Found',
      message: 'The requested account does not exist'
    });
  })

  it("delete non existing profile", async () => {
    const response = await request(profilesURL)
      .delete(`/${dummyProfile.account_id}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 404,
      code: 'ACCOUNT_NOT_FOUND',
      error: 'Account Not Found',
      message: 'The requested account does not exist'
    });
  })

  it("get nonexisting profile", async () => {
    const response = await request(profilesURL)
      .get(`/${dummyProfile.account_id}`)
      .expect(404)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 404,
      code: 'ACCOUNT_NOT_FOUND',
      error: 'Account Not Found',
      message: 'The requested account does not exist'
    });
  })
});

